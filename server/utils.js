const redirectWithMsg = (message, res) => {
	res.redirect('/?msg=' + encodeURIComponent(message));
}

exports.redirectWithMsg = redirectWithMsg;