// Calling the fetchData function when the document is ready
$(document).ready(function () {
    fetchData();  // Call the fetchData function to get data on page load

    // Handle Add User Button Click
    $('#AddUser').click(function () {
        $('#addWindow').addClass('show');  // Show the slide-in window
    });

    // Close Add User Window
    $('#closeAddWindow').click(function () {
        $('#addWindow').removeClass('show');  // Close the slide-in window
    });

    // Handle Add User Button Click
    $('#AddUser').click(function () {
        $('#addWindow').addClass('show');  // Show the slide-in window
    });

    // Close Add User Window
    $('#closeAddWindow').click(function () {
        $('#addWindow').removeClass('show');

    });

    // Handle Add User Form Submission
    $('#addForm').on('submit', function (event) {
        event.preventDefault();  // Prevent form submission

        // Trim spaces from input fields before validation
        var fullName = $('#addFullName').val().trim();
        var dob = $('#addDob').val().trim();
        var location = $('#addLocation').val().trim();
        var email = $('#addEmail').val().trim();
        var languages = $('#addLanguages').val().trim();
        var hobbies = $('#addHobbies').val().trim();

        // Clear any previous error messages
        $('.error').remove();

        // Validate form fields after trimming spaces
        let isValid = true;
        
        if (!fullName) {
            $('#addFullName').after('<p class="error" style="color:red;">Please fill in your full name.</p>');
            isValid = false;
        }

        if (!dob) {
            $('#addDob').after('<p class="error" style="color:red;">Please select your date of birth.</p>');
            isValid = false;
        }

        if (!location) {
            $('#addLocation').after('<p class="error" style="color:red;">Please enter your location.</p>');
            isValid = false;
        }

        if (!email) {
            $('#addEmail').after('<p class="error" style="color:red;">Please enter your email.</p>');
            isValid = false;
        }

        if (!languages) {
            $('#addLanguages').after('<p class="error" style="color:red;">Please enter at least one language.</p>');
            isValid = false;
        }

        if (!hobbies) {
            $('#addHobbies').after('<p class="error" style="color:red;">Please enter at least one hobby.</p>');
            isValid = false;
        }

        // If any field is invalid, do not proceed with form submission
        if (!isValid) {
            return;
        }

        // Create a new user object with the next available userId
        var newUser = {
            fullName: fullName,
            birthDate: dob,
            location: location,
            email: email,
            languages: languages.split(',').map(lang => lang.trim()),  // Split and trim languages input
            hobbies: hobbies.split(',').map(hobby => hobby.trim())     // Split and trim hobbies input
        };

        // Add the new user at the top of the data array
        allData.unshift(newUser);

        // Re-render the table with the updated data
        renderTable(allData);

        // Close the add user window
        $('#addWindow').removeClass('show');

        // Display success message using SweetAlert2
        Swal.fire({
            icon: 'success',
            title: 'User Added!',
            text: 'The new user has been successfully added.',
            confirmButtonText: 'OK'
        });
    });

    // Handle Close Edit Window
    $('#closeEditWindow').click(function () {
        $('#editWindow').removeClass('show');
    });

    // Handle Edit Form Submission
    $('#editForm').on('submit', function (event) {
        event.preventDefault(); // Prevent form submission

        // Show SweetAlert2 confirmation before saving changes
        Swal.fire({
            title: 'Are you sure?',
            text: 'Do you want to save the changes?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, save changes!',
            cancelButtonText: 'No, cancel',
            reverseButtons: true // This makes the "No" button appear on the left
        }).then((result) => {
            if (result.isConfirmed) {
                // If the user confirms, update the current row with new values
                currentRow.fullName = $('#editFullName').val();
                currentRow.birthDate = $('#editDob').val();
                currentRow.location = $('#editLocation').val();
                currentRow.email = $('#editEmail').val();
                currentRow.languages = $('#editLanguages').val().split(',').map(lang => lang.trim());
                currentRow.hobbies = $('#editHobbies').val().split(',').map(hobby => hobby.trim());

                // Re-render the table with updated data
                renderTable(allData);
                populateFilters(allData);

                // Close the edit window
                $('#editWindow').removeClass('show');

                // Show a success message
                Swal.fire(
                    'Saved!',
                    'Your changes have been saved.',
                    'success'
                );
            }
        });
    });

    // Filter based on user selection
    $('#filterButton').click(function () {
        var selectedHobby = $('#hobbiesSelect').val();
        var selectedLanguage = $('#languagesSelect').val();
        var selectedDob = $('#dobSelect').val();

        function formatDateToTwoDigits(date) {
            return new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
        }

        var filteredData = allData.filter(user => {
            var hobbyMatch = selectedHobby ? user.hobbies && user.hobbies.includes(selectedHobby) : true;
            var languageMatch = selectedLanguage ? user.languages && user.languages.includes(selectedLanguage) : true;
            // var dobMatch = selectedDob ? new Date(user.birthDate).toLocaleDateString() === selectedDob : true;
            var dobMatch = selectedDob ? formatDateToTwoDigits(user.birthDate) === selectedDob : true;
            return hobbyMatch && languageMatch && dobMatch;
        });

        renderTable(filteredData);
    });

    // Update the filters dynamically based on the selected filter type
    $('#mainFilter').change(function () {
        var selectedFilter = $(this).val();
        $('#hobbyFilter, #languageFilter, #dobFilter').hide();
        if (selectedFilter === 'hobby') {
            $('#hobbyFilter').show();
        } else if (selectedFilter === 'language') {
            $('#languageFilter').show();
        } else if (selectedFilter === 'dob') {
            $('#dobFilter').show();
        }
    });

    /// to reset the button
    $('#resetButton').click(function () {
        window.location.reload();
    });

    // Attach a click event handler to the Home button
    $('#home').click(function () {
        // Redirect to the home page (you can specify the URL of your homepage here)
        window.location.reload();
        // '/' is the root URL, change this if your home page has a different path
    });

    flatpickr("#dobSelect", {
        dateFormat: "d/m/Y",  // Customize the format (e.g., "yyyy-mm-dd")
        maxDate: "today",     // Optional: Limit the date to today
        locale: "en",         // Set locale to English (you can change it)
    });

    // Export to Excel functionality
    $("#exportButton").click(function () {
        // Get DataTable instance
        var table = $('#datatable').DataTable();

        // Get data from DataTable (including all rows, not just the filtered ones)
        var data = table.rows().data();  // Fetch only visible rows after filtering, change to table.rows().data() for all rows

        // Create an array to hold the data in a 2D format (rows x columns)
        var ws_data = [];

        // Add header row (excluding the "Actions" column)
        var headers = [];
        $('#datatable thead th').each(function (index) {
            // Skip the last column (Actions column)
            if (index !== $('#datatable thead th').length - 1) {
                headers.push($(this).text().trim()); // Get text from each header
            }
        });
        ws_data.push(headers);  // Add headers to the first row

        // Loop through each row of data, excluding the last column (Actions column)
        var rowCount = data.length;  // Get the total row count
        for (var i = 0; i < rowCount; i++) {  // Iterate until the second-to-last row
            var rowData = [];

            // Loop through each cell of the row, excluding the last cell (Actions column)
            $(data[i]).each(function (index, cell) {
                // Skip the last column (Actions column)
                if (index !== data[i].length - 1) {
                    rowData.push(cell);  // Add the cell data to the row data
                }
            });

            ws_data.push(rowData);  // Add the row to the data
        }

        // Create worksheet from the data array
        var ws = XLSX.utils.aoa_to_sheet(ws_data);

        // Create a new workbook and append the worksheet
        var wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "User Data");

        // Generate and download the Excel file
        XLSX.writeFile(wb, "User_Data_Export.xlsx");
    });

    // Handle the "Download PDF" Button Click
    $('#downloadPdfButton').click(function () {
        console.log('Button is clicked');
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Set up header
        doc.setFontSize(18);
        doc.text("User Data", 14, 20);

        // Set up table header
        const columns = ["User ID", "Full Name", "DOB", "Location", "Email", "Languages Known", "Hobbies"];
        const rows = allData.map(user => [
            user.userId || 'N/A',
            user.fullName || 'No Name Provided',
            user.birthDate ? new Date(user.birthDate).toLocaleDateString() : '-',
            user.location || 'Unknown Location',
            user.email || 'No Email Provided',
            user.languages ? user.languages.join(', ') : 'Not Specified',
            user.hobbies ? user.hobbies.join(', ') : 'Not Specified'
        ]);

        // Add the table to the PDF
        doc.autoTable({
            head: [columns],
            body: rows,
            startY: 30, // Start drawing the table at this Y position
        });

        // Save the PDF file
        doc.save("User_Data_Export.pdf");
    });
});

// Function to fetch data via AJAX
function fetchData() {
    $.ajax({
        url: 'https://dummyapi.online/api/social-profiles',
        method: 'GET',
        dataType: 'JSON',
        async: true,
        "Content-Type": "application/json",
        "Accept": "application/json",
        success: function (data) {
            allData = data;
            orginaldata = data;
            renderTable(allData);        // Render the data in the table
            setupSearchBar(allData);     // Set up search functionality
            populateFilters(allData);    // Populate filters
        },
        error: function (err) {
            console.error('Error fetching data:', err);
        }
    });
}

//function to render table
function renderTable(data) {
    var tableHtml = `<table id="datatable" class="table">
        <thead>
            <tr>
                <!--th>User ID</th-->
                <th>Full Name</th>
                <th>DOB (dd-mm-yyyy)</th>
                <th>Location</th>
                <th>Email</th>
                <th>Languages Known</th>
                <th>Hobbies</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>`;

    data.forEach(function (user, index) {
        var rowClass = index % 2 === 0 ? 'even-row' : 'odd-row';
        tableHtml += `<tr data-index="${index}" class="${rowClass}">
            <!--td>${user.userId || 'N/A'}</td-->
            <td class="tooltip-cell" title="${user.fullName || 'No Name Provided'}">${user.fullName || 'No Name Provided'}</td>
           <td class="tooltip-cell" title="${user.birthDate ? new Date(user.birthDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-'}">
             ${user.birthDate ? new Date(user.birthDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-'}
            </td>
            <td class="tooltip-cell" title="${user.location || 'Unknown Location'}">${user.location || 'Unknown Location'}</td>
            <td class="tooltip-cell" title="${user.email || 'No Email Provided'}">${user.email || 'No Email Provided'}</td>
            <td class="tooltip-cell" title="${user.languages ? user.languages.join(', ') : 'Not Specified'}">${user.languages ? user.languages.join(', ') : 'Not Specified'}</td>
            <td class="tooltip-cell" title="${user.hobbies ? user.hobbies.join(', ') : 'Not Specified'}">${user.hobbies ? user.hobbies.join(', ') : 'Not Specified'}</td>
            <td>
                <button class="btn btn-primary btn-sm edit-btn" data-index="${index}">Edit</button>
                <button class="btn btn-danger btn-sm delete-btn" data-index="${index}">Delete</button>
            </td>
        </tr>`;
    });

    tableHtml += `</tbody></table>`;
    $('#datatable-container').html(tableHtml);
    $('#datatable').DataTable(
        {
            "ordering": true,
            "order": [],
            "searching": false
        }
    );
    // Rebind the edit and delete buttons using event delegation
    $('#datatable-container').on('click', '.edit-btn', handleEdit);
    $('#datatable-container').on('click', '.delete-btn', handleDelete);
}

// Handle Edit Button Click
function handleEdit(event) {
    var index = $(event.target).data('index');
    currentRow = allData[index];

    // Populate the edit form with the current row data
    $('#editFullName').val(currentRow.fullName);
    $('#editDob').val(currentRow.birthDate);
    $('#editLocation').val(currentRow.location);
    $('#editEmail').val(currentRow.email);
    $('#editLanguages').val(currentRow.languages ? currentRow.languages.join(', ') : '');
    $('#editHobbies').val(currentRow.hobbies ? currentRow.hobbies.join(', ') : '');

    // Show the edit window
    $('#editWindow').addClass('show');
}

// Handle Delete Button Click
function handleDelete(event) {
    var index = $(event.target).data('index');

    // Show SweetAlert2 confirmation popup
    Swal.fire({
        title: 'Are you sure?',
        text: 'This action cannot be undone.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'No, cancel!',
        reverseButtons: true // This makes the buttons appear in the reverse order
    }).then((result) => {
        if (result.isConfirmed) {
            // If confirmed, delete the row
            deleteRow(index);
            // Show a success message
            Swal.fire(
                'Deleted!',
                'The user has been deleted.',
                'success'
            );
        }
    });
}

// Delete a row
function deleteRow(index) {
    allData.splice(index, 1); // Remove the user from the data array
    renderTable(allData); // Re-render the table with updated data
}

// Setup the Search Bar functionality
function setupSearchBar(data) {
    // Autocomplete functionality on the search bar
    $('#searchBar').autocomplete({
        source: function (request, response) {
            // Filter data based on user input
            var filteredData = data.filter(user => user.fullName.toLowerCase().includes(request.term.toLowerCase()));
            // Return matching names for autocomplete
            response(filteredData.map(user => user.fullName));
        }
    });

    // When the Search button is clicked
    $('#searchButton').click(function () {
        var searchTerm = $('#searchBar').val().toLowerCase();

        // Filter the data based on the search term
        var filteredData = allData.filter(user => user.fullName.toLowerCase().includes(searchTerm));

        // Render the filtered data in the table
        renderTable(filteredData);
    });
}

// Populate Filters dynamically
function populateFilters(data) {

    $('#hobbiesSelect').empty();
    $('#languagesSelect').empty();
    $('#dobSelect').empty();
    // Hobbies Filter
    let hobbyOptions = [...new Set(data.flatMap(user => user.hobbies || []))];
    hobbyOptions.sort();
    $('#hobbiesSelect').append(`<option value="" disabled selected >Select your hobby</option>`);

    hobbyOptions.forEach(hobby => {
        $('#hobbiesSelect').append(`<option value="${hobby}">${hobby}</option>`);
    });

    // Languages Filter
    let languageOptions = [...new Set(data.flatMap(user => user.languages || []))];
    languageOptions.sort();
    $('#languagesSelect').append(`<option value="" disabled selected >Select your language</option>`);

    languageOptions.forEach(language => {
        $('#languagesSelect').append(`<option value="${language}">${language}</option>`);
    });
}

//to get today max date in calender
document.addEventListener("DOMContentLoaded", function () {
    // Get today's date
    const today = new Date();

    // Format the date as yyyy-mm-dd
    const formattedDate = today.toISOString().split('T')[0];

    // Set the max attribute of the addDob input field to today's date
    document.getElementById("addDob").setAttribute("max", formattedDate);
});
