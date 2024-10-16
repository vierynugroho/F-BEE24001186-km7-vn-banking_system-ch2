import app from './app.js';

const PORT = process.env.PORT || 2000;
app.listen(PORT, () => {
	console.log('----------------------------------------------');
	console.log(`Server is running on http://localhost:${PORT}`);
	console.log('----------------------------------------------');
});
