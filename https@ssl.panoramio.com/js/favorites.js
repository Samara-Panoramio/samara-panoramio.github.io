/**
 * Copyright 2009 Google Inc. All Rights Reserved.
 *
 * @author Roger Trias Sanz (rogerts@google.com)
 *
 * @fileoverview This file implements a "favorite user list" with pagination
 * through AJAX. In the main HTML page there will be a node that will contain
 * the favorite user list (more than one list per page are possible). This
 * node may contain HTML initially, which will be shown before the list is
 * loaded. You should call initializeFavoriteUserView after the document is
 * ready; this will send an AJAX request for data to fill the favorite user
 * list container with. It defines a response callback which will set up the
 * appropriate event handlers to manage pagination and UI, so the user of this
 * functionality only has to call initializeFavoriteUserView.
 */


// TODO(rogerts): [post-launch] Add unit tests.


/**
 * Initializes one "favorite user list".
 *
 * @param {JQuery} dom_node JQuery object for the DOM node that will contain the
 *   favorite user list. Its contents will be, from now on, managed by the
 *   JavaScript code. The initial contents of that node, before calling this
 *   function:
 *   - should be what we want the user to see while the initial list is being
 *     loaded.
 *   - must contain a child node with class "initial_url", whose inner HTML
 *     is the URL from where to fetch the initial favorite user list.
 */
function initializeFavoriteUserView(dom_node) {
  url = dom_node.find('.initial_url').text();
  loadFavoriteUserView_(dom_node, url);
}


/**
 * Shows pagination links in a favorite user list if they are useful.
 *
 * If there is a "previous page", a "next page", or both, this will
 * show the pagination links in a favorite user list. If that list has
 * only one page, the links will remain untouched (they are not
 * hidden by this function).
 *
 * @param {JQuery} dom_node JQuery object for the DOM node that contains the
 *   favorite user list.
 */
function showPaginationLinksIfUseful_(dom_node) {
  prev_node = dom_node.find('.ajax_pagination_links .ajax_prev_link');
  next_node = dom_node.find('.ajax_pagination_links .ajax_next_link');
  prev_url = prev_node.attr('js_href');
  next_url = next_node.attr('js_href');
  if (prev_url != '' || next_url != '') {
    dom_node.find('.ajax_pagination_links').show();
  }
}


/**
 * Loads a new page for the favorite user list.
 *
 * The old view of the list is replaced with the received data. Event handlers
 * for the "previous page" and "next page" are created as appropriate. While the
 * new page is loading, a "Loading..." text and icon are shown. In case of
 * failure, the old page is kept.
 *
 * @param {JQuery} dom_node JQuery object for the DOM node that contains the
 *   favorite user list.
 * @param {string} url URL where the new page is to be fetched. The response
 *   will replace the contents of 'dom_node'.
 */
function loadFavoriteUserView_(dom_node, url) {
  // Show in the UI that we are loading.
  dom_node.find('li.loading').show();
  dom_node.find('.ajax_pagination_links').hide();

  callback = function(ajaxResponse, textStatus) {
    // This function is called when the AJAX response comes back.

    // Reenable pagination controls, hide "loading..." indicator.
    showPaginationLinksIfUseful_(dom_node);
    dom_node.find('li.loading').hide();

    if (textStatus != 'success') {
      return;
    }

    // Determine if there are any favorites.
    favorite_node = dom_node.find('.favavatar');
    if (favorite_node.length == 0) {
      dom_node.hide();
      return;
    }

    // Render the G+ follow buttons in the list of favorites on acrylic.
    if (typeof gapi != 'undefined') {
      gapi.follow.go();
    }

    // Add event handlers for the "previous page" and "next page" links,
    // if they are active.
    prev_node = dom_node.find('.ajax_pagination_links .ajax_prev_link');
    prev_url = prev_node.attr('js_href');
    if (prev_url != '') {
      prev_node.click(
          function() {
            loadFavoriteUserView_(dom_node, prev_url);
            return false;
          });
    }

    next_node = dom_node.find('.ajax_pagination_links .ajax_next_link');
    next_url = next_node.attr('js_href');
    if (next_url != '') {
      next_node.click(
          function() {
            loadFavoriteUserView_(dom_node, next_url);
            return false;
          });
    }
  };

  dom_node.load(url, callback);
}
