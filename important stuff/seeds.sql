INSERT INTO departments (name)
VALUES ('Management'),
       ('Accounting'),
       ('Sales');

INSERT INTO roles (title, salary, department_id)
VALUES ('General Manager', 1, '$200,000', 1, 'Management', 4),
       ('Head Accountant', 2, '$150,000', 2, 'Accounting', 4),
       ('Accountant', 3, '$100,000', 3, 'Accounting', 4),
       ('Head of Sales', 4, '$100,000', 4, 'Sales', 4),
       ('Salesman', 4, '$90,000', 4,'Sales', 4),

INSERT INTO employee (first_name, last_name)
VALUES ('John', 1, 'Smith', 1, 'Management', 1),
       ('Beth', 2, 'Davis', 2, 'Accounting', 2),
       ('Mary', 3, 'Doe', 3, 'Accounting', 3),
       ('Jamie', 4, 'Welch', 4, 'Sales', 4),
       ('Dave', 4, 'Smith', 4, 'Sales', 4),
