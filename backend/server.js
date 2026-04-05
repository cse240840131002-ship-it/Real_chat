import 'dotenv/config';
import http from 'http';
import app from './app.js';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import projectModel from './models/project.model.js';
import { generateResult } from './services/ai.service.js';

const port = process.env.PORT || 3000;


// Create HTTP server and Socket.IO server
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*'
    }
});

// Socket.IO authentication middleware and project loading middleware is combined here for efficiency
io.use(async (socket, next) => {

    try {

        const token = socket.handshake.auth?.token || socket.handshake.headers.authorization?.split(' ')[ 1 ];
        const projectId = socket.handshake.query.projectId;

        if (!mongoose.Types.ObjectId.isValid(projectId)) {
            return next(new Error('Invalid projectId'));
        }

// Load project and attach to socket for easy access in event handlers
        socket.project = await projectModel.findById(projectId);


        if (!token) {
            return next(new Error('Authentication error'))
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded) {
            return next(new Error('Authentication error'))
        }

// Attach user info to socket for use in event handlers
        socket.user = decoded;

        next();

    } catch (error) {
        next(error)
    }

})

// Socket.IO connection handler and it handles both messaging and AI response generation based on message content
io.on('connection', socket => {
    socket.roomId = socket.project._id.toString()


    console.log('a user connected');


// Join the project room for real-time collaboration
    socket.join(socket.roomId);

    socket.on('project-message', async data => {

        const message = data.message;
// Check if the message contains the @ai trigger and handle accordingly
        const aiIsPresentInMessage = message.includes('@ai');
        
        //this will broadcast the message to everyone in the room except the sender
        socket.broadcast.to(socket.roomId).emit('project-message', data)

        // If the message is meant for AI, process it and emit the response back to the room
        if (aiIsPresentInMessage) {


            const prompt = message.replace('@ai', '');

            const result = await generateResult (prompt);


            io.to(socket.roomId).emit('project-message', {
                message: result,
                sender: {
                    _id: 'ai',
                    email: 'AI'
                }
            })


            return
        }


    })

    socket.on('disconnect', () => {
        console.log('user disconnected');
        socket.leave(socket.roomId)
    });
});




server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})