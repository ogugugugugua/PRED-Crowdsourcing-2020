module.exports = function strFormat(str, obj){
	return Object.keys(obj).reduce((acc,key) => acc.replace(new RegExp('({)('+ key +')(})','gm'), obj[key]),str)
}      

