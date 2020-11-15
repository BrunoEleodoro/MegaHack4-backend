const apiResponse = require("../helpers/apiResponse");

module.exports = function basic_auth_middleware(req, res, next) {

	// ----------------------------------------------------------------------:
	// authentication middleware
	const auth = { login: "megahack", password: process.env.PASSWORD}; // change thi
	// parse login and password from headers
	const b64auth = (req.headers.authorization || '').split(' ')[1] || '';
	const [login, password] = Buffer.from(b64auth, 'base64').toString().split(':');
	// Verify login and password are set and correct
	if (login && password && login === auth.login && password === auth.password) {
		// Access granted...
		return next();
	}
	apiResponse.unauthorizedResponse(res, "Wrong Admin Credentials");
};
