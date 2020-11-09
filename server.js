const mysql = require("mysql");
const inquirer = require("inquirer");
const logo = require("asciiart-logo");


var connection = mysql.createConnection({
    host: "localhost",

    // Your port; if not 3306
    port: 3306,

    // Your username
    user: "root",

    // Your password
    password: " ",
    database: "employeeDB"
});

connection.connect(function (err) {
    if (err) throw err;
    // Displays start screen logo 
    startScreen();
    // Displays questions
    start();
});
// User input start questions 
function start() {
    inquirer.prompt([
        {
            name: "start",
            type: "rawlist",
            message: "What would you like to do?",
            choices: [
                "View All Employees",
                "View Roles",
                "View Departments",
                "Add Employee",
                "Add Department",
                "Add Role",
                "Update Employee Role",
                "Quit"
            ]
        }
    ]).then(function (answer) {
        switch (answer.start) {
            case "View All Employees":
                employees();
                break;

            case "View Roles":
                roles();
                break;

            case "View Departments":
                departments();
                break;

            case "Add Employee":
                addEmployee();
                break;

            case "Add Department":
                addDepartment();
                break;

            case "Add Role":
                addRoles();
                break;

            case "Update Employee Role":
                updateEmployeeRole();
                break;
            case "Quit":
                quit();
                break;
        }
    });
};
// View All Emplpyees
function employees() {
    var query = "SELECT * FROM employee";
    connection.query(query, function (err, res) {
        if (err) return err;
        // console.table for display
        console.table(res);
        start();
    });
}
// View Roles
function roles() {
    var query = "SELECT * FROM role";
    connection.query(query, function (err, res) {
        if (err) return err;
        // console.table for display
        console.table(res);
        start();
    });
}
// View Departments 
function departments() {
    var query = "SELECT * FROM department";
    connection.query(query, function (err, res) {
        if (err) return err;
        // console.table for display
        console.table(res);
        start();
    });
}
// Add Employee
function addEmployee() {
    connection.query("SELECT * FROM role", (err, res) => {
        if (err) throw err;
        inquirer.prompt([
            {
                name: "firstName",
                type: "input",
                message: "What is the employees first name"
            },
            {
                name: "lastName",
                type: "input",
                message: "What is the employees last name"
            },
            {
                name: "newRole",
                type: "list",
                message: "What is the employees role",
                choices: () => {
                    // Displays the roles from the role table 
                    var roleArray = [];
                    res.forEach(res => {
                        roleArray.push(res.title)
                    });
                    return roleArray;
                }
            }
        ]).then(function (answer) {
            //console.log(answer);
            const employeeRoleId = answer.newRole;
            connection.query('SELECT * FROM role', (err, res) => {
                if (err) throw (err);
                var filteredRole = res.filter(function (res) {
                    return res.title == employeeRoleId;
                })
                // Finds the id for the role 
                var roleId = filteredRole[0].id;
                connection.query("SELECT * FROM employee", (err, res) => {
                    inquirer.prompt([
                        {
                            name: "manager",
                            type: "list",
                            message: "Who is your new employees manager?",
                            choices: () => {
                                // Displays the managers 
                                var managersArray = []
                                res.forEach(res => {
                                    managersArray.push(res.first_name + " " + res.last_name)
                                })
                                return managersArray;
                            }
                        }
                    ]).then(function (managerInput) {
                        const newManager = managerInput.manager;
                        connection.query('SELECT * FROM employee', (err, res) => {
                            if (err) throw (err);
                            var filteredManager = res.filter(function (res) {
                                return res.first_name + " " + res.last_name == newManager;
                            })
                            // Finds the id for the manager 
                            var newManagerId = filteredManager[0].id;
                            //console.log(managerInput);
                            var query = "INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)";
                            var values = [answer.firstName, answer.lastName, roleId, newManagerId]
                            //console.log(values);
                            connection.query(query, values, (err, res, fields) => {
                                // Insert new employee into the table 
                                console.log(`You have added a new employee: ${(values[0])}.`)
                            })
                            start();
                        })
                    })
                })
            })
        })
    })
}
// Add Department
function addDepartment() {
    inquirer.prompt([
        {
            name: "department",
            type: "input",
            message: "What is the new department you would like to add?"
        }
    ]).then(function (answer) {

        var query = "INSERT INTO department (name)VALUES ?";
        // Inserts new department into department table 
        connection.query(query, [answer.department], function (err, res) {
            console.log("\n DEPARTMENT HAS BEEN ADDED \n ");
            if (err) return err;
        })
        start();
    });
}
// Add Roles 
function addRoles() {
    connection.query("SELECT * FROM department", (err, res) => {
        if (err) throw err;
        inquirer.prompt([
            {
                name: "title",
                type: "input",
                message: "What is the name of the role"
            },
            {
                name: "salary",
                type: "input",
                message: "What is the salary for the role"
            },
            {
                name: "roleDepartment",
                type: "list",
                message: "What department is the new role in",
                choices: () => {
                    // Displays the departments from the department table 
                    var departmentArray = [];
                    res.forEach(res => {
                        departmentArray.push(
                            res.name
                        );
                    })
                    return departmentArray;

                }
            }
        ])
            .then(function (answer) {
                const department = answer.roleDepartment;
                connection.query('SELECT * FROM DEPARTMENT', function (err, res) {
                    if (err) throw (err);
                    var dept = res.filter(function (res) {
                        return res.name == department;
                    }
                    )
                    // Selects the id from the chosen department 
                    var roleId = dept[0].id;
                    var query = "INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)";
                    var values = [answer.title, parseInt(answer.salary), roleId]
                    //console.log(values);
                    // Inserts the new role into the role table 
                    connection.query(query, values, (err, res, fields) => {
                        console.log(`You have added a new role: ${(values[0])}.`)
                    })
                    start()
                })
            })
    })
}
// Update Employee
function updateEmployeeRole() {
    connection.query("SELECT * FROM employee", (err, res) => {
        if (err) throw err;
        inquirer.prompt([
            {
                name: "employeeName",
                type: "list",
                message: "Which employee would you like to update?",
                // Displays employees from employee table  
                choices: () => {
                    var employeeArray = [];
                    res.forEach(res => {
                        // Pushes the employees into employeeArray
                        employeeArray.push(res.first_name + " " + res.last_name)
                    });
                    return employeeArray;
                }
            }
        ]).then(function (answer) {
            //console.log(answer);
            // Selects the option the user has chosen 
            const employeeName = answer.employeeName;
            connection.query("SELECT * FROM role", (err, res) => {
                inquirer.prompt([
                    {
                        name: "newRole",
                        type: "list",
                        message: "What is their new role?",
                        choices: () => {
                            // Displays the roles from the role table 
                            var rolesArray = [];
                            res.forEach(res => {
                                rolesArray.push(res.title)
                            })
                            return rolesArray;
                        }
                    }
                ]).then(function (answer) {
                    // Selects the new role that the user has chosen 
                    const role = answer.newRole;
                    connection.query("SELECT * FROM role WHERE title = ?", [role], (err, res) => {
                        if (err) throw err;
                        var updateRoleId = res[0].id;
                        var query = "UPDATE employee SET role_id ? WHERE first_name, last_name ?";
                        var values = [updateRoleId, employeeName];
                        // Updates the employee in the table to the new role 
                        connection.query(query, values, (err, res, fields) => {
                            console.log(`You have updated this employee: ${employeeName}`);
                        })
                        start();
                    })
                })

            })
        })
    })

}
// Quit Connection 
function quit() {
    // End connection
    connection.end(err => {
        if (err) throw err;

    })
};

// Ascii Art Logo Function 
function startScreen() {
    console.log(
        logo({
            name: 'Employee Tracker',
            font: 'Doom',
            lineChars: 10,
            padding: 2,
            margin: 3,
            borderColor: 'grey',
            logoColor: 'grey',
            textColor: 'grey'
        })
            .render()
    );
}