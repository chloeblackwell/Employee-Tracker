const mysql = require("mysql");
const inquirer = require("inquirer");


var connection = mysql.createConnection({
    host: "localhost",

    // Your port; if not 3306
    port: 3306,

    // Your username
    user: "root",

    // Your password
    password: "joseph123$",
    database: "employeeDB"
});

connection.connect(function (err) {
    if (err) throw err;
    start();
});

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

function employees() {
    var query = "SELECT * FROM employee";
    connection.query(query, function (err, res) {
        if (err) return err;
        console.table(res);
        start();
    });
}

function roles() {
    var query = "SELECT * FROM role";
    connection.query(query, function (err, res) {
        if (err) return err;
        console.table(res);
        start();
    });
}

function departments() {
    var query = "SELECT * FROM department";
    connection.query(query, function (err, res) {
        if (err) return err;
        console.table(res);
        start();
    });
}


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
                    var roleArray = [];
                    res.forEach(res => {
                        roleArray.push(res.title)
                    });
                    return roleArray;
                }
            }
        ]).then(function (answer) {
            console.log(answer);
            const employeeRoleId = answer.newRole;
            connection.query('SELECT * FROM role', (err, res) => {
                if (err) throw (err);
                let filteredRole = res.filter(function (res) {
                    return res.title == employeeRoleId;
                })
                let roleId = filteredRole[0].id;
                connection.query("SELECT * FROM employee", (err, res) => {
                    inquirer.prompt([
                        {
                            name: "manager",
                            type: "list",
                            message: "Who is your new employees manager?",
                            choices: () => {
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
                            var newManagerId = filteredManager[0].id;
                            //console.log(managerInput);
                            var query = "INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)";
                            var values = [answer.firstName, answer.lastName, roleId, newManagerId]
                            //console.log(values);
                            connection.query(query, values, (err, res, fields) => {
                                console.log(`You have added a new employee: ${(values[0]).toUpperCase()}.`)
                            })
                            start();
                        })
                    })
                })
            })
        })
    })
}
function addDepartment() {
    inquirer.prompt([
        {
            name: "department",
            type: "input",
            message: "What is the new department you would like to add?"
        }
    ]).then(function (answer) {

        var query = "INSERT INTO department (name)VALUES ?"
        connection.query(query, [answer.department], function (err, res) {
            console.log("\n DEPARTMENT HAS BEEN ADDED \n ");
            if (err) return err;
        })
        start();
    });
}

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
                    let dept = res.filter(function (res) {
                        return res.name == department;
                    }
                    )
                    let roleId = dept[0].id;
                    let query = "INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)";
                    let values = [answer.title, parseInt(answer.salary), roleId]
                    //console.log(values);
                    connection.query(query, values, (err, res, fields) => {
                        console.log(`You have added a new role: ${(values[0]).toUpperCase()}.`)
                    })
                    start()
                })
            })
    })
}

function updateEmployeeRole() {
    connection.query("SELECT * FROM employee", (err, res) => {
        if (err) throw err;
        inquirer.prompt([
            {
                name: "employeeName",
                type: "list",
                message: "Which employee would you like to update?",
                choices: () => {
                    var employeeArray = [];
                    res.forEach(res => {
                        employeeArray.push(res.first_name + " " + res.last_name)
                    });
                    return employeeArray;
                }
            }
        ]).then(function (answer) {
            console.log(answer);
            const employeeName = answer.employeeName;
            connection.query("SELECT * FROM role", (err, res) => {
                inquirer.prompt([
                    {
                        name: "newRole",
                        type: "list",
                        message: "What is their new role?",
                        choices: () => {
                            var rolesArray = [];
                            res.forEach(res => {
                                rolesArray.push(res.title)
                            })
                            return rolesArray;
                        }
                    }
                ]).then(function (answer) {
                    const role = answer.newRole;
                    connection.query("SELECT * FROM role WHERE title = ?", [role], (err, res) => {
                        if (err) throw err;
                        var updateRoleId = res[0].id;
                        var query = "UPDATE employee SET role_id ? WHERE first_name, last_name ?";
                        var values = [updateRoleId, employeeName];
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

function quit() {
    connection.end(err => {
        if (err) throw err;

    })
};