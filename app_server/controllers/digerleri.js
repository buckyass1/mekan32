const hakkinda=function(req, res, next) {
  res.render('hakkinda', { title: 'Hakkında',
             'footer':'Altınay Efe 2021'});
}

module.exports={
	hakkinda
}
