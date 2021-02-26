// Bookmarks and Globals
var main = document.getElementById('main');
var video = document.getElementById('video');
var screen = document.getElementById('screen');
var latest = document.getElementById('latest');
var subscriptions = document.getElementById('subscriptions');
var favorites = document.getElementById('favorites');
var all = document.getElementById('all');
var saved = document.getElementById('saved');
var saved_videos = saved.querySelector('.videos');
var nav = document.getElementById('nav');
var prefs = document.getElementById('preferences');
var options = document.getElementById('options');
var autoplays = document.querySelectorAll('.autoplay');
var input = document.getElementById('input');
var win = document.getElementById('window');
var youtubekey = 'AIzaSyAfrBvS4cGHrdMcLQYCKqcfKELVCx3qadY';
var channelid = '';
var opt_n = localStorage.opt ? parseInt(localStorage.opt) : 0;

if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) document.querySelector('html').classList.add('mobile');
else document.querySelector('html').classList.add('desktop');

if (localStorage.id || localStorage.favorites || localStorage.all || localStorage.saved || localStorage.playlists || localStorage.theme || localStorage.mode || localStorage.pin || localStorage.synced || localStorage.autoplay || localStorage.recent) update_storage();

// New Users
if (!localStorage.ytq_id && !localStorage.ytq_all) {
    main.insertAdjacentHTML('beforeend', '<h2 id="new" class="h2 new wait" data-color><span class="span">New here?</span></h2>');
    document.body.addEventListener('click', e => {
        if (e.target.id === 'new') {
            document.getElementById('toggle').click();
            importingexporting('new');
            setTimeout(() => e.target.style.display = 'none', 1e3);
        }
    });
    setTimeout(() => document.getElementById('new').classList.remove('wait'), 2e3);
}

// News
if (opt_n >= 1 && (!localStorage.ytq_news && !sessionStorage.news)) {
    if (localStorage.ytq_id) {
        main.insertAdjacentHTML('beforeend', '<h2 id="news" class="h2 new wait" data-color><span class="span">Saved videos can now be sorted!</span></h2>');
        document.body.addEventListener('click', e => {
            if (e.target.id === 'news') localStorage.ytq_news = 'Seen it';
        });
        setTimeout(() => document.getElementById('news').classList.remove('wait'), 2e3);
    }
}

// Populate Sections on Load
if (localStorage.ytq_id) channelid = localStorage.ytq_id;
if (localStorage.ytq_favorites) favorites.innerHTML = localStorage.ytq_favorites;
if (localStorage.ytq_all) all.innerHTML = localStorage.ytq_all;
if (localStorage.ytq_saved) saved.querySelector('.videos').innerHTML = localStorage.ytq_saved;

// Supernova Reset

function clear_storage(a) {
	if (a) Object.entries(localStorage).map(x => x[0]).filter(x => x.substring(0, a.length) == a).map(x => localStorage.removeItem(x));

}

function supernova() {
    clear_storage('ytq_');
    setTimeout(() => toggle.click(), 1e3);
    setTimeout(() => fadeOut(nav), 2e3);
    setTimeout(() => fadeOut(main), 3e3);
    setTimeout(() => window.location.reload(true), 4e3);
}

var touch;
var nav_mode = nav.querySelector('.mode');
nav_mode.addEventListener('touchstart', () => { touch = setTimeout(() => supernova(), 4e3) }, false);
nav_mode.addEventListener('touchend', () => clearTimeout(touch), false);

function list_em(array, list, method) {
    if (array && array.length && list) {
        array.forEach(a => {
            
            // Create elements
            var img = document.createElement('img');
            var span_listing = document.createElement('span');
            var span_image = document.createElement('span');
            var span_title = document.createElement('span');
            var li = document.createElement('li');
            var span_handles;
            
            // Apply relevant attributes
            if (list.closest('#latest') || list.closest('#saved')) {
	            var a_id = method === 'upload' ? a.snippet.resourceId.videoId : a.id.videoId;
                img.style.backgroundImage = 'url(' + a.snippet.thumbnails.medium.url + ')';
                span_listing.setAttribute('data-id', a_id);
                span_listing.setAttribute('data-channel', a.snippet.channelTitle.replace(/\'/gm, '’'));
                span_listing.setAttribute('data-channel-id', a.snippet.channelId);
                span_listing.setAttribute('data-date', new Date(a.snippet.publishedAt).getDate() + ' ' + new Date(a.snippet.publishedAt).toLocaleString('en-us', { month: 'short' }) + ' ' + new Date(a.snippet.publishedAt).getFullYear());
                span_title.title = a.snippet.title.replace(/\'/gm, '’') + ' - ' + new Date(a.snippet.publishedAt).getDate() + ' ' + new Date(a.snippet.publishedAt).toLocaleString('en-us', { month: 'short' }) + ' ' + new Date(a.snippet.publishedAt).getFullYear();
                span_title.innerText = a.snippet.title.replace(/\'/gm, '’');
                span_handles = '<span class="span handles"><span class="span save" title="Save" data-color><i class="fa fa-plus"></i></span><span class="span drag" data-color=""><i class="fa fa-bars" aria-hidden="true"></i></span></span>';
                
            } else if (list.closest('#subscriptions')) {
                img.style.backgroundImage = 'url(' + a.snippet.thumbnails.default.url + ')';
                span_listing.setAttribute('data-id', a.snippet.resourceId.channelId);
                span_title.title = a.snippet.title.replace(/\'/gm, '’');
                span_title.innerText = a.snippet.title.replace(/\'/gm, '’');
                span_handles = '<span class="span handles"><span class="span star" data-color=""><i class="fa fa-star" aria-hidden="true"></i><i class="fa fa-star-o" aria-hidden="true"></i></span><span class="span drag" data-color=""><i class="fa fa-bars" aria-hidden="true"></i></span></span>';
            }
    
            // Apply shared attributes
            img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
            img.className = 'img';
            span_image.classList = 'span image';
            span_title.classList = 'span title';
            span_listing.classList = 'span listing';
            li.className = 'li';
            li.title = span_title.title;
            li.setAttribute('data-background', '');
    
            // Add to list
            span_image.appendChild(img);
            span_listing.appendChild(span_image);
            span_listing.appendChild(span_title);
            li.appendChild(span_listing);
            if (span_handles) li.insertAdjacentHTML('beforeend', span_handles);
            if (list.innerHTML.indexOf(span_listing.getAttribute('data-id')) === -1) {
                if (list === all) {
                    if (favorites.innerHTML.indexOf(span_listing.getAttribute('data-id')) === -1) list.appendChild(li);
                } else list.appendChild(li);
            }
                        
        });
    }
}

// Subscriptions
/// Get/Update
function getsubscriptions() {
    if (channelid !== '') {
        if (window.location.hash === '#debug') console.log('Updating subscriptions');
        var url = 'https://www.googleapis.com/youtube/v3/subscriptions?part=snippet&channelId=' + channelid + '&maxResults=50&key=' + youtubekey;
        var nexturl = url + '&pageToken=';
        var list = [];

        fetch(url)
            .then(a => { return a.json() })
            .then(b => {
                var x = b.nextPageToken;
                b.items.forEach(c => list.push(c));
                var s = setInterval(() => {
                    if (x) {
                        var d = fetch(nexturl + x)
                            .then(e => { return e.json() })
                            .then(f => {
                                x = f.nextPageToken;
                                f.items.forEach(g => list.push(g));
                            });
                    } else {
                        clearInterval(s);
                        all.innerHTML = '';
                        var subcount = false;
                        var newlist;
                        setTimeout(() => {
                            newlist = [...new Set(list)];
                            newlist.sort((a, b) => a.snippet.title.localeCompare(b.snippet.title));
                        }, 1e3);
                        setTimeout(() => list_em(newlist, all), 2e3);
                        var si = setInterval(() => {
                            if (newlist.length === all.querySelectorAll('.list .li').length) {
                                clearInterval(si);
                                if (opt_n >= 1) localStorage.ytq_all = all.innerHTML;
                            }
                        }, 1e3);
                    }
                }, 1e3);
            })
            .catch(e => supernova());
    }
}
/// Sort
var s1 = Sortable.create(favorites, {group: '.channels', handle: '.drag', disabled: true });
var s2 = Sortable.create(all, {group: '.channels', handle: '.drag', disabled: true });
var s3 = Sortable.create(saved_videos, {group: '.videos', handle: '.drag', disabled: true });

function saved_reorder() {
    var o = video.classList.contains('pin') ? saved.offsetTop - screen.scrollHeight : saved.offsetTop;
    zenscroll.toY(o, 500);
    var a;
    saved.classList.toggle('edit');
    setTimeout(() => {
        a = saved.classList.contains('edit') ? false : true;
        s3.option('disabled', a);
    }, 100);
    setTimeout(() => {
        if (opt_n >= 1 && a) localStorage.ytq_saved = saved.querySelector('.videos').innerHTML;
    }, 200);
}

function sub_reorder() {
    var o = video.classList.contains('pin') ? subscriptions.offsetTop - screen.scrollHeight : subscriptions.offsetTop;
    zenscroll.toY(o, 500);
    var a;
    subscriptions.classList.toggle('edit');
    setTimeout(() => {
        a = subscriptions.classList.contains('edit') ? false : true;
        s1.option('disabled', a);
        s2.option('disabled', a);
    }, 100);
    setTimeout(() => {
        if (opt_n >= 1 && a) {
            localStorage.ytq_favorites = favorites.innerHTML;
            localStorage.ytq_all = all.innerHTML;
        }
    }, 200);
}

/// Auto-Update
if (opt_n >= 1 && (localStorage.ytq_favorites || localStorage.ytq_all)) {
    if (new Date().getDay() % 2) {
        // Monday, Wednesday, Friday
        if (!localStorage.ytq_recent) {
            getsubscriptions();
            localStorage.ytq_recent = 'recent';
        }
    } else if (localStorage.ytq_recent) localStorage.removeItem('ytq_recent');
} else {
    getsubscriptions();
    if (opt_n >= 1) localStorage.ytq_recent = 'recent';
}

document.querySelectorAll('.active').forEach(a => a.classList = 'li');

// Videos
/// Get
function getlatest(a = 'search') {
    var subscription_id = subscriptions.querySelector('.active .listing').getAttribute('data-id');
    var url = a === 'search' ? 'https://www.googleapis.com/youtube/v3/search?&channelId=' + subscription_id + '&part=snippet,id&order=date&maxResults=16&type=video&key=' + youtubekey : a === 'upload' ? 'https://www.googleapis.com/youtube/v3/playlistItems?part=snippet%2C+id&playlistId=' + subscription_id.replace(/UC/gm, 'UU') + '&order=date&maxResults=16&key=' + youtubekey : '';
    var n = 1;
    fetch(url)
        .then(a => { return a.json() })
        .then(b => {
            var latest_videos = latest.querySelector('.videos');
            latest_videos.innerHTML = '';
            latest_videos.setAttribute('data-page', n);
            latest.querySelector('.youtube .a').setAttribute('href', 'https://www.youtube.com/channel/' + subscription_id);
            if (a === 'upload') b.items.sort((a, b) => new Date(b.snippet.publishedAt) - new Date(a.snippet.publishedAt));
	        list_em(b.items, latest.querySelector('.videos'), a);
	        setactive();
        })
        .catch((e) => console.error(e));
}

/// Load, Play
function loadvideo() {
    var a = document.querySelector('.videos .playing .listing').getAttribute('data-id');
    var b = window.innerWidth >= window.innerHeight ? 'maxresdefault' : 'hqdefault';
    var hd = document.getElementById('hd');
    screen.setAttribute('data-id', a);
    document.getElementById('img').style = document.querySelector('.videos .active .listing .image .img').getAttribute('style');
    hd.style = document.querySelector('.videos .active .listing .image .img').getAttribute('style').replace(/mqdefault/gm, b);
    hd.style.opacity = null;
    document.getElementById('title').innerText = document.querySelector('.videos .active .listing .title').innerText;
    document.getElementById('channel').innerText = document.querySelector('.videos .active .listing').getAttribute('data-channel');
    document.getElementById('channel').parentNode.setAttribute('href', 'https://www.youtube.com/channel/' + document.querySelector('.videos .active .listing').getAttribute('data-channel-id'));
    document.getElementById('date').innerText = document.querySelector('.videos .active .listing').getAttribute('data-date');
    document.getElementById('youtube').querySelector('.a').setAttribute('href', 'https://www.youtube.com/channel/' + document.querySelector('.videos .active .listing').getAttribute('data-channel-id'));
    setTimeout(() => { if ((window.scrollY + screen.scrollHeight) <= (latest.offsetTop - 5)) newsize() }, 500);
    setTimeout(() => hd.style.opacity = 1, 1e3);
}
screen.addEventListener('click', () => playvideo(document.querySelector('.videos .playing .listing').getAttribute('data-id')));

function playvideo(a = document.querySelector('.videos .playing .listing').getAttribute('data-id')) {
    var screen_iframe = screen.querySelector('iframe');
    if (screen_iframe) screen_iframe.parentNode.removeChild(screen_iframe);
    else {
        screen.querySelector('.inner').insertAdjacentHTML('afterbegin', '<div id="x"></div>');
        new YT.Player('x', {
            videoId: a,
            playerVars: {
                autoplay: 1,
                modestbranding: 1,
                rel: 0,
                playsinline: 1,
                iv_load_policy: 3,
                origin: 'https://www.youtube.com'
            },
            events: {
                'onStateChange': onPlayerStateChange
            }
        });
    }
}

///  Autoplay
function onPlayerStateChange(event) {
    if (event.data === 0) {
        var screen_iframe = screen.querySelector('iframe');
        if (screen_iframe) {
            fadeOut(screen_iframe);
            setTimeout(() => screen_iframe.parentNode.removeChild(screen_iframe), 1e3);
        }
        var st = setTimeout(() => {
            if (document.querySelector('.autoplay').classList.contains('on') && document.querySelector('.videos .playing').nextElementSibling) {
                var b;
                if (document.querySelector('.videos .playing').closest('.latest')) b = latest;
                else if (document.querySelector('.videos .playing').closest('.saved')) b = saved;
                var c = b.querySelector('.videos .playing').nextElementSibling;
                var d = [...c.parentNode.children].indexOf(c);
                var e = parseInt(latest.querySelector('.videos').getAttribute('data-page'));
                b.querySelector('.videos .playing').className = 'li';
                c.classList = 'li active playing';
                if (c.closest('#latest') && ((d === 12 && e === 3) || (d === 8 && e === 2) || (d === 4 && e === 1))) latest.querySelector('.more').click();
                setTimeout(() => loadvideo(), 500);
                setTimeout(() => playvideo(document.querySelector('.videos .playing .listing').getAttribute('data-id')), 1500);
            }
        }, 2e3);
        document.querySelectorAll('.videos li').forEach(v => {
            v.addEventListener('click', () => clearTimeout(st));
        });
    }
}

function enableautoplay() {
    autoplays.forEach(a => {
        var section = a.closest('#latest') ? latest : saved;
        var display = section.querySelectorAll('.videos .li').length > 1 ? null : 'none';
        a.style.display = display;
        if (opt_n >= 1 && localStorage.ytq_autoplay) a.classList = 'li autoplay ' + localStorage.ytq_autoplay;
    });
}

autoplays.forEach(a => {
    a.addEventListener('click', () => {
        var state = a.classList.contains('off') ? 'on' : 'off';
        a.classList = 'li autoplay ' + state;
        if (opt_n >= 1) localStorage.ytq_autoplay = state;
        enableautoplay();
    });
});


if (opt_n >= 1 && localStorage.ytq_autoplay) autoplays.forEach(a => a.classList = 'li autoplay ' + localStorage.ytq_autoplay);

/// Active video
function setactive() {
    setTimeout(() => {
        document.querySelectorAll('.videos .listing').forEach(a => {
            var li_classlist;
            if (a.getAttribute('data-id') === screen.getAttribute('data-id')) {
                if (!a.closest('.li').classList.contains('active')) {
                    if (!document.querySelector('.playing')) li_classlist = 'li active playing';
                    else li_classlist = 'li active';
                } else li_classlist = a.closest('.li').classList;
            } else li_classlist = 'li';
            a.closest('.li').classList = li_classlist;
        });
    });
}

// Importing, Exporting
var options_li = options.querySelectorAll('.li');

function updateoptions() {
    options_li.forEach(a => {
        var b = 'ytq_' + a.classList[1];
        a.classList.toggle('hide', opt_n >= 1 && !localStorage.getItem(b));
    });
}

function importingexporting(a) {
    var b = win.getAttribute('data-page');
    var c = 'IDs or URLs';
    var d = 'Bundle code will appear here';
    var t = 500;
    if ((b !== a)) {
        fadeOut(win, t);
        setTimeout(() => {
            win.setAttribute('data-page', a);
            options_li.forEach(a => a.classList.remove('active'));
            input.value = '';
            input.placeholder = a === 'new' ? '' : 'import' ? c : d;
            fadeIn(win, t);
        }, 1000);
    } else {
        input.placeholder = a === 'new' ? '' : 'import' ? c : d;
        fadeToggle(win, t);
    }
    updateoptions();
}

function importurls(a) {
    var list = [];
    var newlist = [];
    var b = a.split(',');
    b.forEach(c => {
        var y = c.includes('&list=WL') ? c.replace(/.*?\?v=|&list=WL.*?$/gm, '') : c.includes('&list') ? c.replace(/.*?&list=|\&.*?$/gm, '') : c.includes('&') ? c.replace(/\&.*?$/gm, '') : c.replace(/.*?=|.*?\//gm, '');
        if (!saved.querySelector('.videos').innerHTML.includes(y)) {
            if (y.startsWith('PL')) {
                var url = 'https://www.googleapis.com/youtube/v3/playlistItems?part=snippet%2C+id&playlistId=' + y + '&maxResults=50&key=' + youtubekey;
                fetch(url)
                    .then(a => { return a.json() })
                    .then(b => {
                        var x = b.nextPageToken;
                        var nexturl = url + '&pageToken=';
                        if (opt_n >= 1 && !localStorage.ytq_playlists) localStorage.ytq_playlists = y;
                        else if (opt_n >= 1 && !localStorage.ytq_playlists.includes(y)) localStorage.ytq_playlists += ',' + y;
                        if (window.location.hash === '#debug') {
                            console.log('Items:');
                            console.log(b.items);
                        }
                        b.items.forEach(c => { if (!saved.querySelector('.videos').innerHTML.includes(c.snippet.resourceId.videoId)) list.push(c) });
                        var s = setInterval(() => {
                            if (x) {
                                var d = fetch(nexturl + x)
                                    .then(e => { return e.json() })
                                    .then(f => {
                                        x = f.nextPageToken;
                                        f.items.forEach(g => { if (!saved.querySelector('.videos').innerHTML.includes(g.snippet.resourceId.videoId)) list.push(g) });
                                    });
                            } else {
                                clearInterval(s);
                                newlist = [...new Set(list)];
                                if (window.location.hash === '#debug') {
                                    console.log('List:');
                                    console.log(list);
                                    console.log('New list:');
                                    console.log(newlist);
                                }
                                setTimeout(() => {
                                    newlist.forEach((a, i) => {
                                        setTimeout(() => {
                                            if (!saved.querySelector('.videos').innerHTML.includes(a.snippet.resourceId.videoId)) {
                                                var url = 'https://www.googleapis.com/youtube/v3/videos?part=snippet%2C+id&id=' + a.snippet.resourceId.videoId + '&key=' + youtubekey;
                                                fetch(url)
                                                    .then(a => { return a.json() })
                                                    .then(b => {
                                                        b.items.forEach(c => {
                                                            if (!saved.querySelector('.videos').innerHTML.includes(c.id)) {
                                                                saved.querySelector('.videos').insertAdjacentHTML('beforeend', '<li class="li" title="' + c.snippet.title.replace(/\'/gm, '&#39;') + ' - ' + new Date(c.snippet.publishedAt).getDate() + ' ' + new Date(c.snippet.publishedAt).toLocaleString('en-us', { month: 'short' }) + ' ' + new Date(c.snippet.publishedAt).getFullYear() + '" data-background><span class="span listing" data-id="' + c.id + '" data-date="' + new Date(c.snippet.publishedAt).getDate() + ' ' + new Date(c.snippet.publishedAt).toLocaleString('en-us', { month: 'short' }) + ' ' + new Date(c.snippet.publishedAt).getFullYear() + '" data-channel="' + c.snippet.channelTitle.replace(/\'/gm, '&#39;') + '" data-channel-id="' + c.snippet.channelId + '"><span class="span image"><img class="img" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" style="background-image:url(' + c.snippet.thumbnails.medium.url + '"></span><span class="span title">' + c.snippet.title.replace(/\'/gm, '&#39;') + '</span></span><span class="span handles"><span class="span save" title="Save" data-color><i class="fa fa-plus"></i></span><span class="span drag" data-color=""><i class="fa fa-bars" aria-hidden="true"></i></span></span></li>');
                                                            }
                                                        });
                                                    })
                                                    .catch(e => console.error(e));
                                            }
                                        }, 10 * i);
                                    });
                                    var sync_display = localStorage.ytq_playlists && localStorage.ytq_playlists !== '' ? null : 'none';
                                    saved.querySelector('.sync').style.display = sync_display;
                                    setTimeout(() => enableautoplay(), 500);
                                }, 1e3);
                            }
                        }, 1e3);
                    })
                    .catch((e) => console.error(e));

            } else {
                var url = 'https://www.googleapis.com/youtube/v3/videos?part=snippet%2C+id&id=' + y + '&key=' + youtubekey;
                fetch(url)
                    .then(a => { return a.json() })
                    .then(b => {
                        if (window.location.hash === '#debug') {
                            console.log('Items:');
                            console.log(b.items);
                        }
                        b.items.forEach(c => {
                            if (saved_videos.innerHTML.includes(c.id)) {
                                saved_videos.insertAdjacentHTML('beforeend', '<li class="li" title="' + c.snippet.title.replace(/\'/gm, '&#39;') + ' - ' + new Date(c.snippet.publishedAt).getDate() + ' ' + new Date(c.snippet.publishedAt).toLocaleString('en-us', { month: 'short' }) + ' ' + new Date(c.snippet.publishedAt).getFullYear() + '" data-background><span class="span listing" data-id="' + c.id + '" data-date="' + new Date(c.snippet.publishedAt).getDate() + ' ' + new Date(c.snippet.publishedAt).toLocaleString('en-us', { month: 'short' }) + ' ' + new Date(c.snippet.publishedAt).getFullYear() + '" data-channel="' + c.snippet.channelTitle.replace(/\'/gm, '&#39;') + '" data-channel-id="' + c.snippet.channelId + '"><span class="span image"><img class="img" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" style="background-image:url(' + c.snippet.thumbnails.medium.url + ')"></span><span class="span title">' + c.snippet.title.replace(/\'/gm, '&#39;') + '</span></span><span class="span handles"><span class="span save" title="Save" data-color><i class="fa fa-plus"></i></span><span class="span drag" data-color=""><i class="fa fa-bars" aria-hidden="true"></i></span></span></li>');
                            }
                        });
                    })
                    .catch(e => console.error(e));
            }
        }
    });
    setTimeout(() => { localStorage.ytq_saved = saved.querySelector('.videos').innerHTML }, 4e3);
}

saved.querySelector('.sync').addEventListener('click', () => {
    var a = saved.querySelector('.sync');
    var on_off = a.classList.contains('off') ? 'on' : 'off';
    a.classList = 'li sync ' + on_off;
    if (opt_n >= 1) {
        localStorage.ytq_synced = on_off;
        if (!on_off) localStorage.ytq_playlists = '';
    }
});

if (opt_n >= 1 && localStorage.ytq_playlists) {
    var on_off = localStorage.ytq_synced && localStorage.ytq_synced === 'on' ? 'on' : 'off';
    saved.querySelector('.sync').classList = 'li sync ' + on_off;
} else saved.querySelector('.sync').style.display = 'none';

function importbundle(a) {
    var bundleid, bundlefavorites, bundleall, bundlesaved, bundleplaylist, bundletheme, bundletime, bundlepin;
    if (a.indexOf('##id##') > -1) bundleid = /##id##(.*?)(?=##|$)/gm.exec(a);
    if (a.indexOf('##favorites##') > -1) bundlefavorites = /##favorites##(.*?)(?=##|$)/gm.exec(a);
    if (a.indexOf('##all##') > -1) bundleall = /##all##(.*?)(?=##|$)/gm.exec(a);
    if (a.indexOf('##saved##') > -1) bundlesaved = /##saved##(.*?)(?=##|$)/gm.exec(a);
    if (a.indexOf('##playlists##') > -1) bundleplaylists = /##playlists##(.*?)(?=##|$)/gm.exec(a);
    if (a.indexOf('##theme##') > -1) bundletheme = /##theme##(.*?)(?=##|$)/gm.exec(a);
    if (a.indexOf('##mode##') > -1) bundletime = /##time##(.*?)(?=##|$)/gm.exec(a);
    if (a.indexOf('##pin##') > -1) bundlepin = /##pin##(.*?)(?=##|$)/gm.exec(a);
    setTimeout(() => {
        if (opt_n >= 1) {
            if (bundleid && (bundleid[1] !== '' && bundleid[1] !== undefined)) localStorage.ytq_id = bundleid[1];
            if (bundlefavorites && (bundlefavorites[1] !== '' && bundlefavorites[1] !== undefined)) localStorage.ytq_favorites = bundlefavorites[1];
            if (bundleall && (bundleall[1] !== '' && bundleall[1] !== undefined)) localStorage.ytq_all = bundleall[1];
            if (bundlesaved && (bundlesaved[1] !== '' && bundlesaved[1] !== undefined)) localStorage.ytq_saved = bundlesaved[1];
            if (bundleplaylists && (bundleplaylists[1] !== '' && bundleplaylists[1] !== undefined)) localStorage.ytq_playlists = bundleplaylists[1];
            if (bundletheme && (bundletheme[1] !== '' && bundletheme[1] !== undefined)) localStorage.ytq_theme = bundletheme[1];
            if (bundletime && (bundletime[1] !== '' && bundletime[1] !== undefined)) localStorage.ytq_mode = bundletime[1];
            if (bundlepin && (bundlepin[1] !== '' && bundlepin[1] !== undefined)) localStorage.ytq_pin = bundlepin[1];
        }
    }, 500);
}

options_li.forEach(a => {
    a.addEventListener('click', () => {
        a.classList.toggle('active');
        setTimeout(() => {
            var b = '';
            if (opt_n >= 1) {
                if (options.querySelector('.id').classList.contains('active')) b += '##id##' + localStorage.ytq_id;
                if (options.querySelector('.favorites').classList.contains('active')) b += '##favorites##' + localStorage.ytq_favorites;
                if (options.querySelector('.all').classList.contains('active')) b += '##all##' + localStorage.ytq_all;
                if (options.querySelector('.saved').classList.contains('active')) b += '##saved##' + localStorage.ytq_saved;
                if (options.querySelector('.playlists').classList.contains('active')) b += '##playlists##' + localStorage.ytq_playlists;
                if (options.querySelector('.theme').classList.contains('active')) b += '##theme##' + localStorage.ytq_theme;
                if (options.querySelector('.mode').classList.contains('active')) b += '##mode##' + localStorage.ytq_mode;
                if (options.querySelector('.pin').classList.contains('active')) b += '##pin##' + localStorage.ytq_pin;
            }
            input.value = b;
        }, 10);
    });
});
input.addEventListener('click', () => { if (win.getAttribute('data-page') === 'export') input.select() });

function exitnav(a) {
    setTimeout(() => fadeOut(win), a);
    setTimeout(() => toggle.click(), 1000 + a);
    setTimeout(() => input.value = '', 2000 + a);
}

document.getElementById('button').addEventListener('click', () => {
    var a = input.value;
    if (a !== '') {
        if (win.getAttribute('data-page') === 'new') {
            if (a.startsWith('http')) importurls(a);
            else if (a.startsWith('##')) importbundle(a);
            else {
                if (opt_n >= 1) {
                    if (a === 'redmond') localStorage.ytq_id = 'UCqMnpO2ok_usDfeoTm36EGA';
                    else if (a === 'victoria') localStorage.ytq_id = 'UCHPVh0gqxn5IO3geNxI6uxQ';
                    else if (a === 'charlie') localStorage.ytq_id = 'UCb2CJSF7SNz55COAHQ3-dBQ';
                    else localStorage.ytq_id = a;
                }
            }
            exitnav(1000);
            setTimeout(() => fadeOut(nav), 3e3);
            setTimeout(() => fadeOut(main), 4e3);
            setTimeout(() => window.location.reload(), 5e3);
        }
        else if (win.getAttribute('data-page') === 'import') {
            importurls(a);
            exitnav(1000);
        }
    }
});

document.getElementById('exit').addEventListener('click', () => exitnav());

// Pinning
function pinz() {
    nav.querySelector('.pin .span').classList.toggle('p');
    if (opt_n >= 1) localStorage.ytq_pin = nav.querySelector('.pin .span').classList.contains('p') ? 'pin' : '';
    pinned();
}

function pinned() {
    if (localStorage.ytq_pin === 'pin') {
        nav.querySelector('.pin .span').classList.add('p');
        if ((window.innerWidth > window.innerHeight) && (window.scrollY > (screen.offsetTop + screen.scrollHeight))) video.classList.add('pin');
        else if (window.innerWidth <= window.innerHeight) video.classList.add('pin');
        else video.classList.remove('pin');
    } else video.classList.remove('pin');
}

pinned();
window.addEventListener('scroll', () => pinned());
window.addEventListener('resize', () => pinned());

// Nav
document.getElementById('toggle').addEventListener('click', () => {
    var a = win.scrollHeight > 0 ? 500 : 0;
    setTimeout(() => nav.classList.toggle('active'), a);
    if (win.scrollHeight > 0) fadeOut(win, 500);
});
var navs = nav.querySelectorAll('.ul .li');
navs.forEach(a => {
    a.addEventListener('click', e => {
        if (a.classList.contains('import')) importingexporting('import');
        else if (a.classList.contains('export')) importingexporting('export');
        else if (a.classList.contains('refresh')) {
            if (e.shiftKey) window.location.reload(true);
            else {
                if (opt_n >= 1 && localStorage.ytq_playlists && saved.querySelector('.sync').classList.contains('on')) importurls(localStorage.ytq_playlists);
                if (all.style.display === 'block') getsubscriptions();
            }
        } else if (a.classList.contains('theme')) themez(e);
        else if (a.classList.contains('mode')) {
            if (e.shiftKey) {
                if (window.confirm('Are you sure you want to trigger a supernova? This will reset everything!')) supernova();
                else return false;
            } else if (e.altKey) window.location = '/ytl';
            else modez();
        } else if (a.classList.contains('pin')) pinz();
    });
});

win.querySelector('.fade').addEventListener('click', () => exitnav());

// Accordion
var h2s = document.querySelectorAll('h2 .title');
h2s.forEach(a => {
    a.addEventListener('click', () => {
        if (!document.getElementById('new')) {
            var h2 = a.closest('.h2');
            var div = h2.nextElementSibling;
            h2.classList.toggle('expanded');
            setTimeout(() => {
                if (h2.classList.contains('expanded')) {
                    if (a.closest('.latest') && !subscriptions.querySelector('.channels .active')) {
                        setTimeout(() => {
                            var b = favorites.querySelector('.li') ? favorites : all;
                            var r = Math.floor(Math.random() * b.querySelectorAll('.li').length);
                            b.querySelectorAll('.li')[r].click();
                            h2.querySelector('.arrow .fa').classList = 'fa fa-angle-up';
                            slideDown(div);
                        }, 1e3);
                        setTimeout(() => enableautoplay(), 2e3);
                    } else {
                        h2.querySelector('.arrow .fa').classList = 'fa fa-angle-up';
                        slideDown(div);
                        setactive();
                        enableautoplay();
                    }
                    if (document.getElementById('news')) {
                        var b = document.getElementById('news');
                        b.classList.add('wait');
                        setTimeout(() => b.parentElement.removeChild(b), 1e3);
                        sessionStorage.news = 'Seen it';
                    }
                } else {
                    h2.querySelector('.arrow .fa').classList = 'fa fa-angle-down';
                    slideUp(div);
                }
                if (a.closest('.subscriptions')) {
                    setTimeout(() => { if (div.style.display === 'none') all.style = '' }, 600);
                }
            });
        }
    });
});

// Section Menus
var menus = document.querySelectorAll('.menu .li');
menus.forEach(a => {
    a.addEventListener('click', () => {
        if (a.closest('.latest')) {
            if (a.classList.contains('more')) {
                var n = parseInt(latest.querySelector('.videos').getAttribute('data-page')) + 1;
                latest.querySelector('.videos').setAttribute('data-page', n);
            }
        } else if (a.closest('.subscriptions')) {
            if (a.classList.contains('more')) slideDown(all, 500);
            else if (a.classList.contains('reorder')) sub_reorder();
            else if (a.classList.contains('refresh')) getsubscriptions();

        } else if (a.closest('.saved')) {
            if (a.classList.contains('reorder')) saved_reorder();
        }
    });
});

function enablereorder() {
    var a = saved_videos.children.length > 1 ? 'block' : 'none';
    saved.querySelector('.reorder').style.display = a;
}

enablereorder();

// Dynamic Content Interaction
document.body.addEventListener('click', e => {
    var a = e.target;
    if (a.localName === 'li') {
        if (a.closest('.saved.edit')) return false;
        else if (a.closest('.videos')) {
            if (a.classList.contains('active')) {
                if (a.classList.contains('playing')) return false;
                else if (document.querySelector('.playing')) {
                    document.querySelector('.playing').classList.remove('playing');
                    a.classList.add('playing');
                }
            } else {
                if (video.querySelector('.screen iframe')) {
                    if (window.confirm('Stop current video?')) {
                        var b = video.querySelector('.screen iframe');
                        b.parentNode.removeChild(b);
                        if (document.querySelector('.videos .active')) document.querySelectorAll('.videos .active').forEach(a => a.classList = 'li');
                        a.classList = 'li active playing';
                        loadvideo();
                        setTimeout(() => setactive(), 10);
                    } else return false;
                } else {
                    if (document.querySelector('.videos .active')) document.querySelectorAll('.videos .active').forEach(a => a.classList = 'li');
                    a.classList = 'li active playing';
                    loadvideo();
                    setTimeout(() => setactive(), 10);
                    if (video.scrollHeight === 0) {
                        slideDown(video);
                        setTimeout(() => { if (opt_n >= 1 && localStorage.ytq_pin && localStorage.ytq_pin === 'pin' && (window.innerHeight > window.innerWidth)) video.classList.add('pin') }, 500);
                    }
                }
                if (!video.classList.contains('pin')) zenscroll.toY(0, 500);
            }
        } else if (a.closest('.channels') && !subscriptions.classList.contains('edit')) {
            if (a.classList.contains('active')) return false;
            if (document.querySelector('.channels .active')) document.querySelector('.channels .active').classList = 'li';
            a.classList.add('active');
            getlatest('upload');
            setTimeout(() => {
                if (latest.querySelector('.videos').scrollHeight === 0) latest.querySelector('.h2 .title').click();
                if (window.innerHeight > window.innerWidth) {
                    var o = video.classList.contains('pin') ? latest.offsetTop - screen.scrollHeight : latest.offsetTop;
                    zenscroll.toY(o, 500);
                }
            }, 250);
            setTimeout(() => enableautoplay(), 750);
        }
    } else if (a.localName === 'span') {
        if (a.classList.contains('save')) {
            if (a.closest('.latest')) {
                if (saved.querySelector('.videos').innerHTML.includes(a.parentNode.previousElementSibling.getAttribute('data-id'))) return false;
                a.title = 'Remove';
                saved.querySelector('.videos').insertAdjacentHTML('beforeend', a.closest('.li').outerHTML);
                setTimeout(() => a.title = 'Save');
            } else {
                var b = a.closest('.li');
                b.parentNode.removeChild(b);
            }
            enableautoplay();
            enablereorder();
            setTimeout(() => localStorage.ytq_saved = saved.querySelector('.videos').innerHTML, 500);
            
        } else if (a.classList.contains('star')) {
            var b = a.closest('.li');
            var c = a.closest('.favorites') ? all : favorites;
            c.insertAdjacentHTML('beforeend', b.outerHTML);
            b.parentNode.removeChild(b);
        }
        setactive();
    }
});

// Theme
function themez(e) {
    var a, b;
    var bc = document.body.classList;
    a = bc.contains('a') ? 'a' : bc.contains('b') ? 'b' : bc.contains('c') ? 'c' : bc.contains('d') ? 'd' : bc.contains('e') ? 'e' : bc.contains('f') ? 'f' : bc.contains('g') ? 'g' : bc.contains('h') ? 'h' : bc.contains('i') ? 'i' : bc.contains('j') ? 'j' : bc.contains('k') ? 'k' : bc.contains('l') ? 'l' : bc.contains('m') ? 'm' : bc.contains('n') ? 'n' : bc.contains('o') ? 'o' : bc.contains('p') ? 'p' : bc.contains('q') ? 'q' : bc.contains('r') ? 'r' : bc.contains('s') ? 's' : bc.contains('aa') ? 'aa' : 'bb';
    b = bc.contains('a') ? 'b' : bc.contains('b') ? 'c' : bc.contains('c') ? 'd' : bc.contains('d') ? 'e' : bc.contains('e') ? 'f' : bc.contains('f') ? 'g' : bc.contains('g') ? 'h' : bc.contains('h') ? 'i' : bc.contains('i') ? 'j' : bc.contains('j') ? 'k' : bc.contains('k') ? 'l' : bc.contains('l') ? 'm' : bc.contains('m') ? 'n' : bc.contains('n') ? 'o' : bc.contains('o') ? 'p' : bc.contains('p') ? 'q' : bc.contains('q') ? 'r' : bc.contains('r') ? 's' : bc.contains('s') ? 'aa' : bc.contains('aa') ? 'bb' : 'a';
    document.body.classList.remove(a);
    document.body.classList.add(b);
    if (opt_n >= 1) localStorage.ytq_theme = b;
}

var touch;
nav.querySelector('.refresh').addEventListener('touchstart', () => { touch = setTimeout(() => window.location.reload(true), 2e3) }, false);
nav.querySelector('.refresh').addEventListener('touchend', () => clearTimeout(touch), false);

/// Recall theme
function recalltheme() {
    var x = opt_n >= 1 && localStorage.ytq_mode ? localStorage.ytq_mode : 'day';
    var y = opt_n >= 1 && localStorage.ytq_theme ? localStorage.ytq_theme : 'aa';
    document.body.classList = 'body ' + x + ' ' + y;
}
recalltheme();

// Night Mode
function modez() {
    var a = document.body.classList.contains('day') ? 'day' : 'night';
    var b = document.body.classList.contains('day') ? 'night' : 'day';
    document.body.classList.remove(a);
    document.body.classList.add(b);
    if (opt_n >= 1) localStorage.ytq_mode = b;
}

// Preferences
if (window.location.hash === '#prefs') prefs.classList.add('active');
prefs.querySelector('.exit').addEventListener('click', () => prefs.classList.remove('active'));

// Resizing
function newsize() {
    var a = document.querySelector('#info .h1').scrollHeight;
    var b = document.querySelector('#info .channel').scrollHeight >= document.querySelector('#info .date').scrollHeight ? document.querySelector('#info .channel').scrollHeight : document.querySelector('#info .date').scrollHeight;
    document.getElementById('info').style.height = a + b + 'px';
}
var resizing;
window.addEventListener('resize', () => {
    clearTimeout(resizing);
    resizing = setTimeout(() => { if ((window.scrollY + screen.scrollHeight) <= (latest.offsetTop - 5)) newsize() }, 1e3);
});
window.addEventListener('scroll', () => { if ((window.scrollY + screen.scrollHeight) <= (latest.offsetTop - 5)) newsize() });

// PWA Service Worker
/*
if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('./sw.js', { scope: './ytq' })
    .then(a => a)
    .catch(e => console.error(e));
}
*/

// Update localStorage

function update_storage() {
	document.body.style.display = 'none';
	console.log('Updating...');
	
	if (opt_n >= 1) {
	    if (localStorage.id) localStorage.ytq_id = localStorage.id;
	    if (localStorage.favorites) localStorage.ytq_favorites = localStorage.favorites;
	    if (localStorage.all) localStorage.ytq_all = localStorage.all;
	    if (localStorage.saved) localStorage.ytq_saved = localStorage.saved;
	    if (localStorage.playlists) localStorage.ytq_playlists = localStorage.playlists;
	    if (localStorage.theme) localStorage.ytq_theme = localStorage.theme;
		if (localStorage.mode) localStorage.ytq_mode = localStorage.mode;
		if (localStorage.pin) localStorage.ytq_pin = localStorage.pin;
		if (localStorage.synced) localStorage.ytq_synced = localStorage.synced;
		if (localStorage.autoplay) localStorage.ytq_autoplay = localStorage.autoplay;
		if (localStorage.recent) localStorage.ytq_recent = localStorage.recent;
	}
	
	setTimeout(() => {
		localStorage.removeItem('id');
		localStorage.removeItem('favorites');
		localStorage.removeItem('all');
		localStorage.removeItem('saved');
		localStorage.removeItem('playlists');
		localStorage.removeItem('theme');
		localStorage.removeItem('mode');
		localStorage.removeItem('pin');
		localStorage.removeItem('synced');
		localStorage.removeItem('autoplay');
		localStorage.removeItem('recent');
	}, 1e3);
	
	setTimeout(() => window.location.reload(), 2e3);
}
