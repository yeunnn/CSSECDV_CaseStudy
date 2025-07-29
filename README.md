# restaurant-system
1. Clone the repository either using the command below or by downloading the contents of the repository.
2. Open Command Prompt inside the folder where the files are placed.
3. Run "npm install" to initialize and install all necessary modules used in the project.
4. Run "node add_data.js" to add data to the database. This will allow the user to login using certain accounts. Then, if needed, press "Ctrl + C". (The js has the listed temporary accounts)
5. Run "node index.js". This will start the local server. Use "localhost:3000" to get access to the server through a browser.

Changelog (11/9/2023)
- So the main changes: The website is kind of restructured na so no more login and sign up for users. 
- They can directly order sa menu to prevent hassle. 
- And, in the cart there's no more table no. its now replaced by the option of Dine in or takeout in which sir in the previous sprints that we should look into having takeouts 
- The order receipt, now shows the respective order the customer has and their order id to know which one is theirs. This is done when a customer does a order in the menu
- The order status, now shows all orders made in the resto. So its like a list of all orders and customers can identify theirs based on the order id they got
- The staff page, is also similar to the order status but with a few buttons for the staff to manage it but mainly just front end, no functions yet

Changelog (11 /23 /2023) Sprint 5
- Seperate into:
	- Guest View (For customers outside - can only see menu and static web)
	- Customer View (For customers inside [Use Ipad] - can see all features menu with order)
	- Admin/Staff View
- Session for admin/staff and customer
- Implementation of ability of staff to manage orders

Changelog (12 /7 /2023) Sprint 6
- Password hashing
- Payment method of either over the counter or swipe credit cart
- Informative Errors
