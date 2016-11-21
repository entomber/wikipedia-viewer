(function(global) {
  'use strict';

  const RESULTS_PER_PAGE = 10;
  const ENDPOINT = 'https://en.wikipedia.org/w/api.php';
  const PARAMS = '?limit=100&action=opensearch&format=json&search=';

  var currentPage = 0;
  var totalResults;
  var pages;
  var data = {};

  var elRandom = document.getElementById('random-container');
  var elResultList = document.getElementById('results-list');
  var elResultsPosition = document.getElementById('results-position');
  var elPageMin = document.getElementById('page-min');
  var elPageMax = document.getElementById('page-max');
  var elTotalItems = document.getElementById('total-items');
  var elSearchForm = document.getElementById('search');
  var elSearchInput = document.getElementById('search-input');
  var elClear = document.getElementById('clear');
  var elPrevious = document.getElementById('previous');
  var elNext = document.getElementById('next');

  /* Bind processData to the global scope so loaded script can call it.
   * JSONP loaded script is inserted in separate script tag into the head,
   * in a completely different scope and thus you can only share variables
   * with it through the global scope. 
   */
  var processData = global.processData = function (response) {
    console.log(response);
    if (response[1] && response[1].length !== 0) {
      data = response;
      console.log(response);
      totalResults = data[1].length;
      pages = Math.ceil(totalResults / RESULTS_PER_PAGE);
      // console.log('totalResults: %i\npages: %i', totalResults, pages);
      showResults(1);
      setNavigation();   
    } else {
      pages = 0;
      showNoResults();
      setNavigation();
    }
  };

  /* Formats and displays results on page.
   * @param {Number} page - the page to display
   */
  function showResults(page) {
    if (page > pages || page < 1) {
      console.log('shouldn\'t be here');
      return;
    }
    if (elResultList) { /* clear the results */
      elResultList.innerHTML = '';
    }
    var resultOffset = (page-1) * RESULTS_PER_PAGE; // pg1: starts at 0, pg2: starts at 1*RESULTS_PER_PAGE, pg3: starts at 2*RESULTS_PER_PAGE
    console.log('resultOffset: '+resultOffset);

    for (let i = resultOffset; i < totalResults; i++) {
      if (i >= (resultOffset + RESULTS_PER_PAGE)) {
        break;
      }
      const titles = data[1];
      const snippets = data[2];
      const links = data[3];
      let currentResult = [];
      currentResult.push('<div class="search-result">');
      currentResult.push('<a href=' + links[i] + ' target="_blank">');
      currentResult.push('<p class="title">' + titles[i] +'</p>');
      currentResult.push('<p class="snippet">' + snippets[i] + '</p>');
      currentResult.push('</a>');
      currentResult.push('</div>');
      currentResult = currentResult.join('');

      elResultList.insertAdjacentHTML('beforeend', currentResult);

      elRandom.classList.add('padding-bottom');

      var elCurrentResult = elResultList.children[i-resultOffset];
      window.getComputedStyle(elCurrentResult).opacity;
      elCurrentResult.style.opacity = 1;
    }

    elPageMin.textContent = resultOffset + 1;
    if (resultOffset + RESULTS_PER_PAGE < totalResults) {
      elPageMax.textContent = resultOffset + RESULTS_PER_PAGE;
    } else {
      elPageMax.textContent = totalResults;
    }
    elTotalItems.textContent = totalResults;
    elResultsPosition.style.display = '';

    currentPage = page;
  }

  /* Formats and displays no reuslts found.
   */
  function showNoResults() {
    if (elResultList) { /* clear the results */
      elResultList.innerHTML = '';
    }
    var noResults = [];
    noResults.push('<div class="search-result">');
    noResults.push('<p class="none">No results found</p>');
    noResults.push('</div>');
    noResults = noResults.join('');

    elResultList.insertAdjacentHTML('afterbegin', noResults);

    elRandom.classList.add('padding-bottom');
    window.getComputedStyle(elResultList.children[0]).opacity;
    elResultList.children[0].style.opacity = 1;

    elNext.style.display = 'none';
    elPrevious.style.display = 'none';
    elResultsPosition.style.display = 'none';

    currentPage = 0;
  }

  /* Shows or hides the previous and next navigation buttons.
   */
  function setNavigation() {
    if (currentPage < pages) {
      elNext.style.display = '';
    } else {
      elNext.style.display = 'none';
    }
    if (currentPage > 1) {
      elPrevious.style.display = '';
    } else {
      elPrevious.style.display = 'none';
    }
  }

  /*
   *  Event Handlers
   */

  /* Initiates search when user enters some value in search bar and presses enter.
   */
  function handleSearch(event) {
    event.preventDefault(); // Otherwise the form will be submitted
    if (elSearchInput.value !== '') {
      var url = ENDPOINT + PARAMS + elSearchInput.value + '&callback=processData';
      var script = document.createElement('script');
      script.src = url;
      document.head.appendChild(script);
      document.head.removeChild(script); // remove so we don't keep creating script elements
      console.log(url);
      // getSearchResults(url);
    }
    return false; // Prevents submitting in some other browsers
  }

  /* Displays the cancel search button when there is some input in the search bar.
   */
  function handleShowClear() {
    if (elSearchInput.value !== '') {
      elClear.style.display = '';
    } else if (elSearchInput.value === '') {
      elClear.style.display = 'none';
    }
  }

  /* Resets page when cancel search button is pressed.
   */
  function handleClear() {
    elSearchInput.value = '';
    if (elResultList.hasChildNodes()) {
      var searchResult = document.getElementsByClassName('search-result');
      for (let i = 0; i < searchResult.length; i++) {
        searchResult[i].style.opacity = '0';
      }
    }
    setTimeout(function() {
      elResultList.innerHTML = '';
    }, 550);
    elClear.style.display = 'none';
    elNext.style.display = 'none';
    elPrevious.style.display = 'none';
    elResultsPosition.style.display = 'none';
    elRandom.classList.remove('padding-bottom');
    data = {};
    pages = 0;
  }

  /* Change page when next button is pressed.
   */
  function handleNext() {
    if (currentPage < pages) {
      currentPage++;
      showResults(currentPage);
      setNavigation();
    }
  }

  /* Change page when previous button is pressed.
   */
  function handlePrevious() {
    if (currentPage > 1) {
      currentPage--;
      showResults(currentPage);
      setNavigation();
    }
  }

  elSearchForm.addEventListener('submit', handleSearch, false);
  elSearchInput.addEventListener('input', handleShowClear, false);
  elClear.addEventListener('click', handleClear, false);
  elNext.addEventListener('click', handleNext, false);
  elPrevious.addEventListener('click', handlePrevious, false);

}(window)); // reference to window object
