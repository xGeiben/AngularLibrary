var app = angular.module('myApp', ['ui.bootstrap', 'ngMaterial', 'ngMessages']); // We initialize the module and import bootstrap and angular material

app.controller('mainController', function($scope, $http, $mdDialog, $mdToast) { //this is our main controller this is where all the logic in the front end its gonna happend


  $scope.formData = {} // Object with the data from the form when adding a new book
  $scope.users = []; // Array of all users
  $scope.categories = []; // Array of all categories
  $scope.books = []; // Array of all books
  $scope.totalItems; // Total of books showed in the list
  $scope.totalPages; // Total of pages in the list of books
  $scope.active = 0; // Index of the current image on the banner
  $scope.currentPage = 1; //Current page showing on the list of books
  $scope.pageSize = 5; // Total number of books shown by page
  $scope.newBook = false; // Variable to know when the user clicked the add new book button so we show the for
  $scope.loading = false; // Variable to know when the page is loading
  var slides = $scope.slides = [{ // Array containing all the info and the images urls for the banner
      image: '../assets/banner1.jpg',
      text: 'Come visit our new library and get your library card in 5 minutes!',
      id: 0
    },
    {
      image: '../assets/banner2.jpg',
      text: 'Enjoy our collection with over 5000 books !',
      id: 1
    },
    {
      image: '../assets/banner3.jpg',
      text: 'Feel like in your own house in one of our 6 lecture rooms',
      id: 2
    }
  ];

  // Load the books, categories and users when the page is loaded
  // Function used to  get all the books
  $http.get('/api/books').then(
    function successCallback(response) {
      $scope.books = response.data; // Every book its gonna be stored in the books array
      $scope.totalPages = Math.ceil(response.data.length / 5); //We calculate the total number of pages on our list we rounded up the result
      $scope.totalItems = $scope.totalPages * 10; // We have to multiply to 10 because the paginator that we are using adds a new page every 10 items
    },
    function errorCallback(response) {
      console.log(response); // We show errors to the user, usually the logging and 'cleaning' of error happend in the backend
    });
  //Function used to get all the categories
  $http.get('/api/categories').then(
    function successCallback(response) {
      $scope.categories = response.data; // Every category its gonna be stored in the cagegories array
    },
    function errorCallback(response) {
      console.log(response); // We show errors to the user, usually the logging and 'cleaning' of error happend in the backend
    });
  // Function used to get all the users
  $http.get('/api/users').then(
    function successCallback(response) {
      $scope.users = response.data; // Every user its gonna be stored in the users array
    },
    function errorCallback(response) {
      console.log(response); // We show errors to the user, usually the logging and 'cleaning' of error happend in the backend
    });
  //Function used to save a book
  $scope.saveBook = function() {
    $scope.loading = true;
    if ($scope.formData.name == undefined || $scope.formData.author == undefined || $scope.formData.category == undefined || $scope.formData.published == undefined)
      return;
    var foundIndex = $scope.categories.findIndex(x => x.name == $scope.formData.category); // unfortunately  angular js doesnt have support yet for DataList i couldnt find a way to bind the ID with the book form object
    $scope.formData.category = $scope.categories[foundIndex]._id; // So i had to do a little trick before saving or editing to get the ID of the selected category.
    if ($scope.formData._id == undefined) {
      $http.post('/api/books', $scope.formData).then(
        function successCallback(response) {
          $scope.books = response.data; // Every time we save a book the API response contains all books, so we update the books array with the new data
          $scope.totalPages = Math.ceil(response.data.length / 5); //We calculate the total number of pages on our list we rounded up the result
          $scope.totalItems = $scope.totalPages * 10;
          $scope.formData = {}; // We clean the form
          $scope.newBook = false; // And hide it
          $scope.loading = false;
        },
        function errorCallback(response) {
          $scope.loading = false;
          console.log(response); // We show errors to the user, usually the logging and 'cleaning' of error happend in the backend
        }
      )
    } else {
      $http.put('/api/books', $scope.formData).then(
        function successCallback(response) {
          $scope.books = response.data; // Every time we save a book the API response contains all books, so we update the books array with the new data
          $scope.totalPages = Math.ceil(response.data.length / 5); //We calculate the total number of pages on our list we rounded up the result
          $scope.totalItems = $scope.totalPages * 10;
          $scope.formData = {}; // We clean the form
          $scope.newBook = false; // And hide it
          $scope.loading = false;
        },
        function errorCallback(response) {
          console.log(response); // We show errors to the user, usually the logging and 'cleaning' of error happend in the backend
        }
      )
    }
  }
  // Function used to show the form to add a new book
  $scope.showForm = function() {
    $scope.newBook = true; // The container of the form is showed by ng-if="newBook"
  }
  // Function used to hide the form
  $scope.hideForm = function() {
    $scope.newBook = false; // The container of the form is showed by ng-if="newBook"
  }
  // Function used to show the modal containing all the details of the books and the actions of assign and DELETE
  $scope.showDetails = function(book) {
    // Appending dialog to document.body to cover sidenav in docs app
    // Modal dialogs should fully cover application
    // to prevent interaction outside of dialog
    $mdDialog.show({
      controller: DialogController,
      templateUrl: '../views/bookdialog.tmpl.html', // this is the file that contains all  the HTML of the modal
      parent: angular.element(document.body),
      targetEvent: book,
      clickOutsideToClose: true,
      fullscreen: $scope.customFullscreen,
      scope: $scope,
      preserveScope: true,
      locals: {
        book: book
      }
    })
  };
  // Modal controller
  function DialogController($scope, $mdDialog, book) {
    $scope.book = book; // The data of the book that we are reviewing we obtained it as a parameter from the list so we can use it on our html template
    $scope.assign = false; // Variable to know when the user clicked the assign book button so we show the dropdown of users
    $scope.AssignObj = { // Object with the data of the book and the user to wich we are gonna assign the book
      bookID: book._id // By default we assign the id of the book that we are recieving as a parameter
    };
    $scope.assigned = (book.currentUser == undefined) ? false : true; // if book doesnt have a current user $scope.assigned will be false, else $scope.assigned will be true
    // Function used to assign a book to a user
    $scope.assignBook = function() {
      if ($scope.AssignObj.userID == undefined)
        return;
      $scope.loading = true;
      $http.post('/api/assign', $scope.AssignObj).then(
        function successCallback(response) {
          $scope.assign = false; // Hide the dropdown and the button to assign book to user
          $scope.assigned = true; // We mark the book as assigned
          $scope.book = response.data[0]; // Update the book info
          var foundIndex = $scope.books.findIndex(x => x._id == $scope.book._id); // We find the index of the book that we update in the array of books
          $scope.books[foundIndex] = $scope.book; // And we update it with the new info
          $scope.loading = false;
        },
        function errorCallback(response) {
          $scope.loading = false;
          console.log(response);
        }
      )
    };
    $scope.unnasign = function() {
      $scope.loading = true;
      $scope.AssignObj.userID = $scope.book.currentUser._id;
      $http.post('/api/unassign', $scope.AssignObj).then(
        function successCallback(response) {
          $scope.assigned = false; // We mark the book as assigned
          $scope.book = response.data[0]; // Update the modal book info
          var foundIndex = $scope.books.findIndex(x => x._id == $scope.book._id); // We find the index of the book that we update in the array of books
          $scope.books[foundIndex] = $scope.book; // And we update it with the new info
          $scope.loading = false;

        },
        function errorCallback(response) {
          $scope.loading = false;
          console.log(response);
        }
      )
    }
    $scope.deleteBook = function() {
      $scope.loading = true;
      $http.delete('/api/books/' + book._id).then(
        function successCallback(response) {
          console.log("deleted"); // Show message that we successfully deleted the book
          $scope.books = response.data; // The API response contains an array of all the books so we update our array of books with the new data
          $mdDialog.hide(); // Close the modal
          $scope.loading = false;
        },
        function errorCallback(response) {
          $scope.loading = false;
          console.log(response);
        }
      )
    }
    $scope.hide = function() {
      $mdDialog.hide();
    };
    $scope.edit = function() {
      $scope.formData = book;
      $scope.formData.category = book.category.name;
      $mdDialog.cancel();
    }
    $scope.cancel = function() {
      $mdDialog.cancel();
    };
  }

});
