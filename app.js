const express = require('express');
const cors = require('cors');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const session = require('express-session');

const app = express();
const port = 3000;

// CORS middleware kullanımı
app.use(cors({
    origin: 'http://127.0.0.1:5500',
    credentials: true
}));

// Diğer middleware'lerin kullanımı buraya gelecek...
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

// MySQL veritabanı bağlantı bilgileri
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'tur_rezervasyon'
});

// MySQL veritabanıyla bağlanma
connection.connect((err) => {
    if (err) {
        console.error('MySQL bağlantısı başarısız: ' + err.stack);
        return;
    }
    console.log('MySQL bağlantısı başarılı. Bağlantı kimliği: ' + connection.threadId);
});

// CORS başlıkları ekle (CORS hatalarını önlemek için)
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://127.0.0.1:5500');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

// Navbar oluştururken kullanıcı oturum açmışsa adını navbar'a ekleyin
app.use((req, res, next) => {
    const userSession = req.session.user;

    if (userSession && userSession.firstName) {
        res.locals.firstName = userSession.firstName;
    } else {
        res.locals.firstName = '';
    }

    next();
});

// Signup formundan POST request
app.post('/signup', (req, res) => {
    const { firstName, lastName, phone, email, password, password2 } = req.body;

    if (password !== password2) {
        return res.status(400).send('Şifreler uyuşmuyor.');
    }

    const sql = 'INSERT INTO Customers (FirstName, LastName, Phone, Email, Password) VALUES (?, ?, ?, ?, ?)';
    connection.query(sql, [firstName, lastName, phone, email, password], (err, result) => {
        if (err) {
            console.error('Veritabanına ekleme hatası: ' + err);
            return res.status(500).send('Veritabanına ekleme hatası.');
        }
        res.send('Kayıt başarılı!');
    });
});

// Signin formundan POST request
app.post('/signin', (req, res) => {
    const { email, password } = req.body;

    const sql = 'SELECT * FROM Customers WHERE Email = ? AND Password = ?';
    connection.query(sql, [email, password], (err, result) => {
        if (err) {
            console.error('Veritabanı sorgusu hatası: ' + err);
            return res.status(500).send('Giriş sırasında bir hata oluştu.');
        }

        if (result.length > 0) {
            req.session.user = {
                firstName: result[0].FirstName,
                customerID: result[0].CustomerID
            };
            res.json({ message: 'Giriş başarılı!', firstName: result[0].FirstName });
        } else {
            res.status(400).json({ message: 'E-posta veya şifre hatalı.' });
        }
    });
});

// Rezervasyon formundan POST request
app.post('/submit-reservation', (req, res) => {
    const { packageName, startDate, endDate } = req.body;
    const customerID = req.session.user ? req.session.user.customerID : null;

    if (!customerID) {
        return res.status(401).send('Lütfen önce giriş yapın.');
    }

    const sql = 'INSERT INTO reservations (Startdate, Enddate, customerID, packageName) VALUES (?, ?, ?, ?)';
    connection.query(sql, [startDate, endDate, customerID, packageName], (err, result) => {
        if (err) {
            console.error('Rezervasyon ekleme hatası: ' + err);
            return res.status(500).send('Rezervasyon ekleme hatası.');
        }
        res.send('Rezervasyon başarılı!');
    });
});

app.listen(port, () => {
    console.log(`Sunucu ${port} portunda çalışıyor`);
});
