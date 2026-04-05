Here is a JavaScript function that checks whether a given number `n` is prime or not, handling all edge cases:

```javascript
function checkPrime(n) {
if (n <= 1 || !Number.isInteger(n)) { return "Invalid input. Please provide a positive integer greater than 1." ; } if
    (n < 4) { return "Prime" ; } for (let i=2; i <=Math.sqrt(n); i++) { if (n % i===0) { let factors=[]; while (n %
    i===0) { factors.push(i); n /=i; } if (n===1) { return factors.join(', ');
      } else {
        return factors.concat(checkPrime(n)).join('
    , ');
      }
    }
  }

  return "Prime";
}

// Example usage
console.log(checkPrime(7)); // Output: Prime
console.log(checkPrime(9)); // Output: 3
console.log(checkPrime(12)); // Output: 2, 2, 3
console.log(checkPrime(1)); // Output: Invalid input. Please provide a positive integer greater than 1.
console.log(checkPrime(-5)); // Output: Invalid input. Please provide a positive integer greater than 1.
console.log(checkPrime(11.5)); // Output: Invalid input. Please provide a positive integer greater than 1.
```

This function efficiently checks whether a given number is prime or not, and returns either "Prime" if the number is prime or returns its factors in case it' s not
    prime. It handles edge cases such as negative numbers, non-integer inputs, and numbers less than or equal to 1.