  
/*
A date formatter filter for Nunjucks
*/
module.exports = function(dateIn) {
    return new Date(dateIn).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric'});
}