const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'check_in_db'
});

db.connect(err => {
    if (err) throw err;
    console.log('Database connected...');
});

app.post('/tasks', (req, res) => {
    const { work_type,  process_name, start_time, end_time, status } = req.body;
    const sqlQuery = `INSERT INTO daily_work (work_type,  process_name, start_time, end_time, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())`;
    db.query(sqlQuery, [work_type,  process_name, start_time, end_time, status], (err, result) => {
        if (err) {
            return res.status(400).json({ error: 'Failed to add task' });
        }
        
        res.status(201).json({ message: 'Task added successfully', taskId: result.insertId });
    });
});


app.get('/tasks', (req, res) => {
    const { start_time } = req.query;
    let sqlQuery = `SELECT * FROM daily_work`;
    
    if (start_time) {
        sqlQuery += ` WHERE DATE(start_time) = ?`;
    }

    db.query(sqlQuery, [start_time], (err, results) => {
        if (err) {
            
            return res.status(404).json({ error: 'Failed to list tasks' });
        }
        
        res.status(200).json(results);
    });
});


app.put('/tasks/:id', (req, res) => {
    const { id } = req.params;
    const { work_type, process_name, start_time, end_time, status } = req.body;
    const sqlQuery = `UPDATE daily_work SET work_type = ?, process_name = ?, start_time = ?, end_time = ?, status = ? WHERE id = ?`;
    db.query(sqlQuery, [work_type, process_name, start_time, end_time, status, id], (err, result) => {
        if (err) {
            return res.status(400).json({ error: 'Failed to update task' });
        }
        res.status(200).json({ message: 'Task updated successfully', taskId: result.insertId });
    });
});

app.delete('/tasks/:id', (req, res) => {
    const { id } = req.params;
    const query = `DELETE FROM daily_work WHERE id = ?`;
    db.query(query, [id], (err, result) => {
        if (err) {
            return res.status(400).json({ error: 'Failed to deleted task' });
        }
        res.status(200).json({ message: 'Task deleted successfully'});
    });
});

app.get('/tasks/report', (req, res) => {
    const { month } = req.query;
    const query = `SELECT status, COUNT(*) AS count FROM daily_work WHERE MONTH(start_time) = ? GROUP BY status`;
    db.query(query, [month], (err, results) => {
        if (err) {
            
            return res.status(404).json({ error: 'Failed to list tasks' });
        }
        
        res.status(200).json(results);
    });
});

app.listen(3000, () => {
    console.log('Server started on port 3000...');
});
