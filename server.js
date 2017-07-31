// server.js
// where your node app starts
const 	express = require('express'),
	url = require('url'),
	qs = require('querystring'),
	cookieParser = require('cookie-parser'),
	GoogleImages = require('google-images');
const	cseId = '008578979207880262721:dbod6lff6a8',
	apiKey = '',
	secret = 'CP7AWaXDfAKIRfH49dQzKJx7sKzzSoPq7/AcBBRVwlI3';

const app = express(),
	  router = express.Router();
const cse = new GoogleImages(cseId, apiKey);

router.get('/latest', (req, res) => {
	console.log(`${req.ip} got the browsing history\n`);
	res.type('json').send(JSON.stringify(req.signedCookies.history, null, 1));
});
router.get('/:term', (req, res) => {
	const cseOption = {	page: qs.parse(url.parse(req.url).query).offset },
		  cookieOption = { maxAge: 1000*60*60*24*7, signed: true };

	const history = req.signedCookies.history == undefined ? [{
		term: req.params.term, 
		when: (new Date()).toJSON() 
	}] : req.signedCookies.history.concat({
		term: req.params.term, 
		when: (new Date()).toJSON() 
	});
	res.cookie('history', history, cookieOption);
	
	cse.search(req.params.term, cseOption).then(images => {
		console.log(`${req.ip} has access the cse and query for - ${req.params.term} -\n`);
		res.type('json').send(JSON.stringify(images, null, 1));
	});
});
//Serve the static files directly by built-in middleware func
app.use('/public', express.static(`${process.cwd()}/public`));
app.use(cookieParser(secret));
app.use('/api/imagesearch', router);
// Respond not found to all the wrong routes
app.use((req, res) => {
  res.status(404);
  res.type('txt').send('404 - Page Not Found');
});
// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
