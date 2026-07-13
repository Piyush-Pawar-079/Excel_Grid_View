const fs = require('fs');

const firstNames = ['John', 'Jane', 'Alex', 'Emily', 'Chris', 'Katie', 'Michael', 'Sarah', 'David', 'Laura'];
const lastNames = ['Smith', 'Doe', 'Johnson', 'Brown', 'Williams', 'Jones', 'Miller', 'Davis', 'Wilson', 'Taylor'];
const departments = ['Engineering', 'Sales', 'Marketing', 'HR', 'Finance', 'IT', 'Operations', 'Legal'];

const records = [];
for (let i = 0; i < 50000; i++) {
    const fn = firstNames[Math.floor(Math.random() * firstNames.length)];
    const ln = lastNames[Math.floor(Math.random() * lastNames.length)];
    const age = 20 + Math.floor(Math.random() * 40);
    const salary = 50000 + Math.floor(Math.random() * 100000);
    const dept = departments[Math.floor(Math.random() * departments.length)];
    
    records.push({
        id: i + 1,
        firstName: fn,
        lastName: ln,
        age: age,
        department: dept,
        salary: salary
    });
}

fs.writeFileSync('employees.json', JSON.stringify(records));
console.log('Created employees.json with 50k records.');
