import inquirer from "inquirer";
import pg from "pg";

const { Pool } = pg;
const pool = new Pool({
    user: 'postgres',
    password: '123admin',
    host: "localhost",
    database: 'employeetracker_db',
    port: 5432,
});

const connectToDb = async () => {
    try {
        await pool.connect();
        console.log("Connected to the Database");
    } catch (err) {
        console.error("Failed to connect to the database", err);
    }
};

const startMenu = () => {
    inquirer.prompt({
        message: 'Choose one of the following:',
        name: 'menu',
        type: 'list',
        choices: [
            'View departments',
            'View roles',
            'View employees',
            'Add a department',
            'Add a role',
            'Add an employee',
            'Update an employee role',
            'Exit',
        ],
    })
    .then(response => {
        switch (response.menu) {
            case 'View departments':
                viewAllDepartments();
                break;
            case 'View roles':
                viewAllRoles();
                break;
            case 'View employees':
                viewAllEmployees();
                break;
            case 'Add a department':
                addDepartment();
                break;
            case 'Add a role':
                addRole();
                break;
            case 'Add an employee':
                addEmployee();
                break;
            case 'Update an employee role':
                updateEmployeeRole();
                break;
            default:
                pool.end();
                console.log("Connection closed.");
        }
    });
};

const viewAllDepartments = async () => {
    try {
        const res = await pool.query('SELECT * FROM department');
        console.table(res.rows);
        startMenu();
    } catch (err) {
        console.error('Error fetching departments:', err);
    }
};

const viewAllRoles = async () => {
    try {
        const res = await pool.query(`
            SELECT
                r.id,
                r.title,
                d.name AS department,
                r.salary
            FROM role r
            JOIN department d ON r.department_id = d.id
        `);
        console.table(res.rows);
        startMenu();
    } catch (err) {
        console.error('Error fetching roles:', err);
    }
};

const viewAllEmployees = async () => {
    try {
        const res = await pool.query(`
            SELECT
                e.id,
                e.first_name,
                e.last_name,
                r.title,
                d.name AS department,
                r.salary,
                CONCAT(m.first_name, ' ', m.last_name) AS manager
            FROM employee e
            JOIN role r ON e.role_id = r.id
            JOIN department d ON r.department_id = d.id
            LEFT JOIN employee m ON e.manager_id = m.id
        `);
        console.table(res.rows);
        startMenu();
    } catch (err) {
        console.error('Error fetching employees:', err);
    }
};

const addDepartment = () => {
    inquirer.prompt([
        {
            name: 'department',
            type: 'input',
            message: 'Please enter a department.',
        },
    ])
    .then(async (answer) => {
        try {
            await pool.query('INSERT INTO department (name) VALUES ($1)', [answer.department]);
            console.log('Department successfully added!');
            startMenu();
        } catch (err) {
            console.error('Error adding department:', err);
        }
    });
};

const addRole = () => {
    pool.query('SELECT id, name FROM department', (err, res) => {
        if (err) {
            console.error('Error fetching departments:', err);
            return;
        }

        const departmentNames = res.rows.reduce((acc, curr) => {
            acc[curr.name] = curr.id;
            return acc;
        }, {});

        inquirer.prompt([
            {
                name: 'role',
                type: 'input',
                message: 'Please input your role in the company.',
            },
            {
                name: 'salary',
                type: 'input',
                message: 'Please enter your salary.',
            },
            {
                name: 'department',
                type: 'list',
                message: 'Please select which department your role is in.',
                choices: Object.keys(departmentNames),
            },
        ]).then(async (answers) => {
            const departmentID = departmentNames[answers.department];
            try {
                await pool.query(
                    'INSERT INTO role (title, salary, department_id) VALUES ($1, $2, $3)',
                    [answers.role, answers.salary, departmentID]
                );
                console.log('Role added!');
                startMenu();
            } catch (err) {
                console.error('Error adding role:', err);
            }
        });
    });
};

const addEmployee = () => {
    pool.query('SELECT id, title FROM role', (err, roleRes) => {
        if (err) {
            console.error('Error fetching roles:', err);
            return;
        }

        const roleNames = roleRes.rows.reduce((acc, curr) => {
            acc[curr.title] = curr.id;
            return acc;
        }, {});

        pool.query('SELECT id, CONCAT(first_name, \' \', last_name) AS name FROM employee', (err, managerRes) => {
            if (err) {
                console.error('Error fetching managers:', err);
                return;
            }

            const managers = managerRes.rows.reduce((acc, curr) => {
                acc[curr.name] = curr.id;
                return acc;
            }, {});

            inquirer.prompt([
                {
                    name: 'firstName',
                    type: 'input',
                    message: 'Please input your first name',
                },
                {
                    name: 'lastName',
                    type: 'input',
                    message: 'Please input your last name.',
                },
                {
                    name: 'role',
                    type: 'list',
                    message: 'Please select your role in the company.',
                    choices: Object.keys(roleNames),
                },
                {
                    name: 'manager',
                    type: 'list',
                    message: 'Please select your manager.',
                    choices: Object.keys(managers),
                },
            ]).then(async (answers) => {
                const roleID = roleNames[answers.role];
                const managerID = managers[answers.manager];
                try {
                    await pool.query(
                        'INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4)',
                        [answers.firstName, answers.lastName, roleID, managerID]
                    );
                    console.log('Employee added!');
                    startMenu();
                } catch (err) {
                    console.error('Error adding employee:', err);
                }
            });
        });
    });
};

const updateEmployeeRole = () => {
    pool.query('SELECT id, CONCAT(first_name, \' \', last_name) AS name FROM employee', (err, empRes) => {
        if (err) {
            console.error('Error fetching employees:', err);
            return;
        }

        const employees = empRes.rows.reduce((acc, curr) => {
            acc[curr.name] = curr.id;
            return acc;
        }, {});

        pool.query('SELECT id, title FROM role', (err, roleRes) => {
            if (err) {
                console.error('Error fetching roles:', err);
                return;
            }

            const roles = roleRes.rows.reduce((acc, curr) => {
                acc[curr.title] = curr.id;
                return acc;
            }, {});

            inquirer.prompt([
                {
                    name: 'employee',
                    type: 'list',
                    message: 'Select the employee to update:',
                    choices: Object.keys(employees),
                },
                {
                    name: 'role',
                    type: 'list',
                    message: 'Select the new role:',
                    choices: Object.keys(roles),
                },
            ]).then(async (answers) => {
                const employeeId = employees[answers.employee];
                const roleId = roles[answers.role];
                try {
                    await pool.query(
                        'UPDATE employee SET role_id = $1 WHERE id = $2',
                        [roleId, employeeId]
                    );
                    console.log(`Role updated for ${answers.employee}`);
                    startMenu();
                } catch (err) {
                    console.error('Error updating employee role:', err);
                }
            });
        });
    });
};

// Start the application
connectToDb().then(startMenu);
