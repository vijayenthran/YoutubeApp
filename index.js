
// Module Pattern.
let youtubePlay = (function(){
  let nextPageToken, prevPageToken;
  const MaxResults = 20;
  let config= {
    url: 'https://www.googleapis.com/youtube/v3/search',
    data:{
      maxResults: `${MaxResults}`,
      key: 'AIzaSyBBU2vCbES6Hpr0cQ-Kz-bCtFsW5Wig3pM',
      part: 'snippet',
      q:'',
      type: 'video'
    },
    dataType: 'json',
    type: 'GET'
  };

  function prevPage () {
   let obj = {prevPageToken:nextPageToken};
   callYoutubeApi(obj);
   return;
 }

// handle display of Vidoes when Next Page button is clicked
function nextPage () {
  delete config.data.q;
  let obj = {nextPageToken:nextPageToken};
  callYoutubeApi(obj);
  return;
}

// Display Text to Users when there are no results found
function handleNoResult(){
  $('.no-result').removeClass('remove-display');
  $('.Next-Page').addClass('remove-display');
  return;
}

// Handle Success Ajax Call
function handleSuccess (success) {
  $('.no-result').addClass('remove-display');
  $('.error').addClass('remove-display');
  let thumbnails = $('.videos');
  let element = success.items.map(function(item){
    return $(`<img src="${item.snippet.thumbnails.medium.url}" class='video-Thumbnail' data-videoid= "${item.id.videoId}">`);
  });
  nextPageToken = success.nextPageToken;
  prevPageToken = success.prevPageToken;
  thumbnails.find('img').remove();
  thumbnails.append(element);
  if(success.pageInfo.totalResults === 0){
    handleNoResult();
  }
  return;
}

// Handle Failure Ajax Call
function handleFailure (failure) {
 console.log(failure);
 $('.error').removeClass('remove-display');
 $('.Next-Page').addClass('remove-display');
 return;
}

// The only function Expression expressed out of this Module
let callYoutubeApi = function(search){
  if(search.searchKeyword){
    config.data.q = search.searchKeyword;
  }else if(search.nextPageToken){
    config.data.pageToken = search.nextPageToken;
  }else if(search.prevPageToken){
    config.data.pageToken = search.prevPageToken;
  }
  return $.ajax(config)
  .then(function(success){
    handleSuccess(success);
  })
  .catch(function(failure){
    handleFailure(failure);
  });
};

return {
  serverCall : callYoutubeApi,
  nextPageCall : nextPage,
  prevPageCall  : prevPage
};
})();

// Handle the next page click
function handleNextPageClick() {
 $('.Next-Page').removeClass('remove-display');
 $('.Next-Page').on('click', 'input', function(event){
  event.preventDefault();
  $('.Previous-Page').removeClass('remove-display');
  youtubePlay.nextPageCall();
});
 handlePrevPageClick();
}

// Handle prev page click
function handlePrevPageClick() {
  $('.Previous-Page').on('click', 'input', function(event){
    event.preventDefault();
    youtubePlay.prevPageCall();
  });
}

// Close the Video that is playing on the Iframe
function closePlayingVideo(){
  $('.outerDiv').on('click', function(event){
    $('.videowrapper').addClass('remove-display');
    $('.outerDiv').addClass('remove-display');
    $('.videowrapper').find('iframe').attr('src', '');
  });
  return;
}

// Click Thubmnail to play the Video in an Iframe
function thumbnailClick(){
  $('.videos').on('click', 'img', function(event){
    let videoId = $(this).data('videoid');
    $('.videowrapper').find('.loader').removeClass('remove-display');
    $('.videowrapper').find('iframe').attr('src', `https://www.youtube.com/embed/${videoId}?rel=0`);
    $('.videowrapper').removeClass('remove-display');
    $('.outerDiv').removeClass('remove-display');
    closePlayingVideo();
  });
  return;
}

// Fetch Call to perform ajax request when the search(Form-Submit) Btn is Clicked.
function fetchVideos(){
  $('form').submit(function(event){
    $('.Previous-Page').addClass('remove-display');
    let searchkey = $('.form-input').val();
    event.preventDefault();
    youtubePlay.serverCall({searchKeyword : searchkey});
    $('.form-input').val('');
    handleNextPageClick();
  });
  thumbnailClick();
  return;
}

$(fetchVideos());