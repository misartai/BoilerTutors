# BoilerTutors - Team 30 - CS 307
![boiler tutors transparent(1)](https://github.com/user-attachments/assets/ac855bbc-528a-41ce-a04a-34945298561c)

# Find all of your class resources and more here!

# Purpose
The purpose of this project is to give students a “one stop shop” for resources related to tutoring and online help for classes at Purdue University. Currently there are many resources for students to reach out about coursework/homework through various tutoring websites. The problem with this is that all of these resources aren’t in one place, making it very inconvenient to look for tutoring or help regarding a course as there are various places to look through. Our goal is to eliminate this inconvenience and help streamline the process of acquiring a tutor or general help with courses so students can spend more time focusing on their academics rather than navigating through the many tutoring resources trying to find out where they can get help. 

The application will combine resources across multiple websites to give students a consistent and up to date resource for external help for their classes in one  website that is accessible on mobile and desktop. This application will include a discussion board where students can ask questions to tutors/professors on specific courses. Additionally, students can look at questions and answers that other people have posted, even with an option to opt into receiving notifications on selected threads. There will also be a direct messaging feature where students will be able to directly message tutors if the discussion board isn’t personalized or helpful enough for the student. A calendar will be used to provide students information about office hours and the various schedules of the tutors on the website. Professors will be able to send out announcements on their corresponding course’s discussion board as well as upload any course notes/slides that they choose to. 

# Design Outline
# High Level Overview:
This project will be a web application that will allow students to interact on discussion boards, send direct messages to tutors, and view office hours/tutor schedules on a calendar. This application will use a client-server model where a server is used to simultaneously handle accesses from multiple users using Java. The server will accept user requests, access/store data in the database, and then provide the appropriate feedback to the users. 

# Client:
Provides an interactive interface for the user
Send requests to the server based off of user interaction/requests
Receives corresponding changes that server processes

# Server:
Handles client requests (allows for the handling of multiple users at a time)
Server validates requests and checks if a database query is necessary (sends a query to database if needed)
Server responds to request and the user interface/client receives them

# Database: 
A relational database used to store all data for the application (user data, course data, calendar data, etc.)
Responds to queries from the server, and then sends the corresponding data to the server
Detailed Overview:

The client receives JSON Files from Spring Data, which is a Java package. HTTPS functions send data into Spring Data as well, which then connects to MongoDB to connect to the NoSQL database. There are two main databases here, one that will hold key values like emails, names, course IDs and smaller single line entries. The JSON section will hold longer, more complex items like TA lists, course lists, appointments and recurring events like classes. NoSQL can handle a variety of data types and keep them separate, which matches perfectly for items with different security levels, length, and priority for fetching frequently expected items like calendar events.
