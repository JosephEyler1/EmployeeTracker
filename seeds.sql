\c employeetracker_db;

INSERT INTO department (name)
VALUES ('Management'),
       ('Accounting'),
       ('Sales');

INSERT INTO role (title, salary, department_id)
VALUES ('General Manager', 200000, 1),
       ('Head Accountant', 150000, 2),
       ('Accountant', 100000, 2),
       ('Head of Sales', 100000, 3),
       ('Salesman', 90000, 3);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ('John', 'Smith', 1, NULL),
       ('Beth', 'Davis', 2, 1),
       ('Mary', 'Doe', 3, 1),
       ('Jamie', 'Welch', 4, 1),
       ('Dave', 'Smith', 5, 1);
