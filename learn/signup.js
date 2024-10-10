// Create the form dynamically and insert it into the DOM
const formContainer = document.getElementById('form-container');

const form = document.createElement('form');
form.id = 'signupForm';

// Add the form heading
const heading = document.createElement('h2');
heading.textContent = 'Create Your Account';
form.appendChild(heading);

// Add the Name field
const nameLabel = document.createElement('label');
nameLabel.setAttribute('for', 'name');
nameLabel.textContent = 'Name:';
form.appendChild(nameLabel);
form.appendChild(document.createElement('br'));

const nameInput = document.createElement('input');
nameInput.type = 'text';
nameInput.id = 'name';
nameInput.name = 'name';
nameInput.required = true;
form.appendChild(nameInput);

// Add the Email field
const emailLabel = document.createElement('label');
emailLabel.setAttribute('for', 'email');
emailLabel.textContent = 'Email:';
form.appendChild(emailLabel);
form.appendChild(document.createElement('br'));

const emailInput = document.createElement('input');
emailInput.type = 'email';
emailInput.id = 'email';
emailInput.name = 'email';
emailInput.required = true;
form.appendChild(emailInput);

// Add the Password field
const passwordLabel = document.createElement('label');
passwordLabel.setAttribute('for', 'password');
passwordLabel.textContent = 'Password:';
form.appendChild(passwordLabel);
form.appendChild(document.createElement('br'));

const passwordInput = document.createElement('input');
passwordInput.type = 'password';
passwordInput.id = 'password';
passwordInput.name = 'password';
passwordInput.required = true;
form.appendChild(passwordInput);

// Add the Submit button
const submitButton = document.createElement('button');
submitButton.type = 'submit';
submitButton.textContent = 'Sign Up';
form.appendChild(submitButton);

formContainer.appendChild(form);

// Handle form submission
form.addEventListener('submit', function(event) {
  event.preventDefault(); // Prevent the form from submitting in the default way

  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  // Validate email ends with "@purdue.edu"
  if (!email.endsWith('@purdue.edu')) {
    alert('Please use a valid Purdue email address ending with "@purdue.edu".');
    return; // Stop the form submission if validation fails
  }

  // Send the data to the server using fetch
  fetch('http://localhost:3000/signup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, email, password }),
  })
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        return response.text().then(errorMessage => {  // Extract the error message
          throw new Error(errorMessage);  // Throw the error with the server's message
        });
      }
    })
    .then(data => {
      alert('Account created successfully!');  // Display success message
    })
    .catch((error) => {
      alert(error.message);  // Display the specific error message from the server
    });
});
