let snoowrap = require("snoowrap");
const http = require("node:http");
const fsp = require('fs/promises');

async function getFirstMeme() {
	let file = await fsp.readFile(`${__dirname}/memes.txt`);
	let lines = file.toString().split("\n");
	let memeUrl = '';

	for (let i = 0; i < lines.length; i++) {
		let [url, flag] = lines[i].split(" ");
		if (flag === "False") {
			lines[i] = `${url} True`;
			memeUrl = url;
			break;
		}
	}

	await fsp.writeFile(`${__dirname}/memes.txt`, lines.join("\n"));
	return memeUrl;
}


function createServer() {
	const hostname = "0.0.0.0";
	const port = 3000;
	const server = http.createServer(async (req, res) => {
		if (req.url === '/') {
			res.statusCode = 200;
			res.setHeader("Content-Type", "text/plain");
			let memeUrl = await getFirstMeme();
			res.end(memeUrl);
		} else {
			res.statusCode = 404;
			res.end('Not Found');
		}
	});
	server.listen(port, hostname, () => {
		console.log(`Server running at http://${hostname}:${port}/`);
	});
}

const user = new snoowrap({
	userAgent:
		"eyJhbGciOiJSUzI1NiIsImtpZCI6IlNIQTI1NjpzS3dsMnlsV0VtMjVmcXhwTU40cWY4MXE2OWFFdWFyMnpLMUdhVGxjdWNZIiwidHlwIjoiSldUIn0.eyJzdWIiOiJ1c2VyIiwiZXhwIjoxNzA4MTA2ODYyLjQxMTQzNSwiaWF0IjoxNzA4MDIwNDYyLjQxMTQzNSwianRpIjoiaUM0YXBTV2RZbFp6ajFqX2FlbDllMzBPbVRSNmJnIiwiY2lkIjoidUFmWl9CRXo4VVpvVEM3YTVzOG5pdyIsImxpZCI6InQyX3U5Z3J6MmRsNiIsImFpZCI6InQyX3U5Z3J6MmRsNiIsImxjYSI6MTcwODAxODQ0MzI2Niwic2NwIjoiZUp4RWprRnV4U0FNUk9faWRXNVVkV0d3eWJjS09MSk5xdHktb3ZEYjNZaGhudDhIWkdNaUNZY0RtbExYNEpXeTlqQkpJOVIyMTFEcVgxZmtoQU44Sk04bWFXNDhiT1FZeHVUeFZKNmplOUctNVV1WUpPYjQ4WkgtTF9wSWJiMHJWVDFYdU5UZk9xV2kyUHlIOTliU2VQR3ZrREVTSEhDWjNCamMyQjFQWHNXbE5wbEMzRVBpZ1FPcTNOeXc0emtwbUxPT3ZxLUdZU21TdC1XR3ZtV1Y1dU5LenJYQUFTX3hVSnZNNWZiNUV3QUFfXzl4bTJfdCIsInJjaWQiOiI4aDVTbGtGN09DVzk4ZXZhcmxHMll1TG81SmlNaXhXbWJmam9LeFJXbmxRIiwiZmxvIjo4fQ.kjcSC_H7OBw0jkSU1NkHUyyItRiVzGOcOV4Wx17ffVFuzLtB8YIujBpVm4TDiOUh5XXYbxMHkIxPLBA0qpS9Lv6qdHbzbUVMuJOxVAmo8guiRfCHScovGBWK0dDXWr0p8TPFNDjjpEoFGnL9350mwSdnJLja61i4enUFeW93Mqpc-nWqCd-VUXpvtLvyD_rMYW1nflIBJ1SCiO_f92tTWnFZ_i4AoCxNzerZea0mMwnSPIr0lkI4cULOhUXKQrdAryJT2D3Hy4h5VysXK5InrpFnQooKYm3ajvz9yTinks8MGgDA3yDGUj3W_V6LA5VhoWL6fNeCVCGDNUCxOSxVaw",
	clientId: "uAfZ_BEz8UZoTC7a5s8niw",
	clientSecret: "boffp82kgVWgjNiOacTeH3Wq_nFPLw",
	refreshToken: "85375094702154-HaKpJQCvQVbAkeDqtFE7pPcD-FvEPw",
});

async function fetchPosts() {
	let posts = [];
	let listing = await user
		.getSubreddit("ProgrammerHumor")
		.getTop({ time: "all", limit: 1000 });
	await listing.fetchAll().then((postListing) => {
		posts = postListing;
	});
	posts.sort((a, b) => b.score - a.score);
	for (let post of posts) {
		await fsp.appendFile(
			`${__dirname}/memes.txt`,
			`https://www.reddit.com${post.permalink} False\n`
		);
	}
}

async function getMeme() {
	await fetchPosts();
	createServer();
}

getMeme();