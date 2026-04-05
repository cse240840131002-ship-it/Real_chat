import projectModel from "../models/project.model.js";
import * as projectService from '../services/project.service.js';
import userModel from '../models/user.model.js';
import { validationResult } from 'express-validator';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';

export const createProject=async(req,res)=>{
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try{
    const { name } = req.body;
    const loggedInUser = await userModel.findOne({ email: req.user.email });
    const userId = loggedInUser._id;

    const newProject= await projectService.createProject({
        name,userId
    });
        res.status(201).json(newProject);
} catch (err) {
    console.log(err);
    res.status(400).send(err.message);
}
}
export const getAllProjects=async(req,res)=>{
    try{
        const loggedInUser = await userModel.findOne({ email: req.user.email });
        
        const allUserProjects= await projectService.getAllProjectByUserId({userId: loggedInUser._id});
        res.status(200).json({ projects: allUserProjects });
    } catch (err) {
        console.log(err);
        res.status(400).json(err.message);
    }
}

export const addUserToProject=async(req,res)=>{
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try{
        const { projectId,users } = req.body;

        const loggedInUser = await userModel.findOne({ email: req.user.email });

        const project= await projectService.addUserToProject({
            projectId,
            users,
            userId: loggedInUser._id
        });
       return res.status(200).json({
        
        project
    })
   
   
   
    } catch (err) {
        console.log(err);
        return res.status(400).json(err.message);
    }
}

export const getProjectById = async (req, res) => {
    const { projectId } = req.params;

    try {
        const project = await projectService.getProjectById({ projectId });

        return res.status(200).json(project);  // ✅ THIS WAS MISSING

    } catch (err) {
        console.log(err);
        return res.status(400).json({ message: err.message });
    }
};


// 
export const updateFileTree = async (req, res) => {
    try {
        const { projectId, fileTree } = req.body;

        if (!projectId || !fileTree) {
            return res.status(400).json({
                message: "projectId and fileTree are required"
            });
        }

        console.log("Project ID:", projectId);

        // ✅ 1. SAVE TO DATABASE
        const updatedProject = await projectModel.findByIdAndUpdate(
            projectId,
            { fileTree: fileTree },
            { new: true }
        );

        console.log("Saved to DB ✅");

        // ✅ 2. SAVE TO FILE SYSTEM
        const projectPath = `./containers/${projectId}`;

        if (!fs.existsSync(projectPath)) {
            fs.mkdirSync(projectPath, { recursive: true });
        }

        for (const fileName in fileTree) {
            const filePath = path.join(projectPath, fileName);
            const content = fileTree[fileName].file.contents;

            fs.writeFileSync(filePath, content);
        }

        console.log("Files written ✅");

        // ✅ 3. RUN PROJECT
        exec(`cd ${projectPath} && npm install`, (err) => {
            if (err) {
                console.error("Install error:", err);
                return;
            }

            exec(`cd ${projectPath} && node app.js`, (err) => {
                if (err) {
                    console.error("Run error:", err);
                    return;
                }

                console.log("Server started 🚀");
            });
        });

        return res.status(200).json({
            success: true,
            project: updatedProject
        });

    } catch (error) {
        console.error("Update File Tree Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};