 (function(exports) {
    'use strict';
    
    function buildLink(post) {
        return '<a class="blog-feed__post__link" href="' + post.link + '" target="_blank">' + post.title + '</a>';
    }
    
    function buildItem(post) {
        return '<li class="blog-feed__post"><span class="blog-feed__post__content">' + buildLink(post) + '</span></li>';
    }
    
    exports.processFeed = function(data) {
        var content = data.posts.map(buildItem).join('');
        document.querySelector('#blog-feed').innerHTML = content;
    };
    
    var script = document.createElement('script');
    script.src = 'http://blog.jeremyfairbank.com/feed.json';
    document.head.appendChild(script);
})(window);
