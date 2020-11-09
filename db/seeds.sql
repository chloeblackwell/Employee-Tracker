USE employeeDB;
INSERT INTO department(id, name)
VALUES (1, "Sales"),
    (2, "Finance"),
    (3, "Legal"),
    (4, "Customer Support"),
    (5, "IT");
INSERT INTO role(id, title, salary, department_id)
VALUES (1, "Salesperson", 30000, 1),
    (2, "Sales Manager", 70000, 1),
    (3, "IT Manager", 90000, 5),
    (4, "Software Engineer", 60000, 5),
    (5, "Accountant", 50000, 2),
    (6, "Legal Team Manager", 70000, 3),
    (7, "Lawyer", 60000, 3),
    (8, "Customer Service Rep", 40000, 4),
    (9, "Customer Service Manager", 60000, 4);
INSERT INTO employee(id, first_name, last_name, role_id, manager_id)
VALUES (1, "John", "Doe", 3, null),
    (2, "Mike", "Chan", 4, 1),
    (3, "Ashley", "Rodriguez", 7, 4),
    (4, "Sarah", "Lourd", 6, null),
    (5, "Kevin", "Tupik", 1, 7),
    (6, "Malia", "Brown", 8, 8),
    (7, "Tom", "Allen", 2, null),
    (8, "Tammer", "Galal", 9, null),
    (9, "Christian", "Eckenrode", 5, null);