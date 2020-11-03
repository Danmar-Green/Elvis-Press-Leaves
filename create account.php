<?php
// Include config file
require_once "config.php";
 
// Define variables and initialize with empty values
$first_name = $last_name = $username = $password = $confirm_password = "";
$username_err = $password_err = $confirm_password_err = "";
 
// Processing form data when form is submitted
if($_SERVER["REQUEST_METHOD"] == "POST"){
    
    // Validate first name
    if(empty(trim($_POST["first_name"]))){
        $username_err = "Please enter a first_name.";
    } else{
        // Prepare a select statement
        $sql = "SELECT id FROM users WHERE firstName = ?";
        
        if($stmt = mysqli_prepare($link, $sql)){
            // Bind variables to the prepared statement as parameters
            mysqli_stmt_bind_param($stmt, "s", $param_first_name);
            
            // Set parameters
            $param_first_name = trim($_POST["first_name"]);
            
            // Attempt to execute the prepared statement
            if(mysqli_stmt_execute($stmt)){
                /* store result */
                mysqli_stmt_store_result($stmt);
                $first_name = trim($_POST["username"]);
                
            } else{
                echo "Oops! Something went wrong. Please try again later.";
            }

            // Close statement
            mysqli_stmt_close($stmt);
        }
    }
    // Validate last name
    if(empty(trim($_POST["last_name"]))){
        $username_err = "Please enter a last_name.";
    } else{
        // Prepare a select statement
        $sql = "SELECT id FROM users WHERE lastName = ?";
        
        if($stmt = mysqli_prepare($link, $sql)){
            // Bind variables to the prepared statement as parameters
            mysqli_stmt_bind_param($stmt, "s", $param_last_name);
            
            // Set parameters
            $param_first_name = trim($_POST["last_name"]);
            
            // Attempt to execute the prepared statement
            if(mysqli_stmt_execute($stmt)){
                /* store result */
                mysqli_stmt_store_result($stmt);
                $last_name = trim($_POST["username"]);
                
            } else{
                echo "Oops! Something went wrong. Please try again later.";
            }

            // Close statement
            mysqli_stmt_close($stmt);
        }
    }*/
    // Validate username
    if(empty(trim($_POST["username"]))){
        $username_err = "Please enter a username.";
    } else{
        // Prepare a select statement
        $sql = "SELECT id FROM users WHERE username = ?";
        
        if($stmt = mysqli_prepare($link, $sql)){
            // Bind variables to the prepared statement as parameters
            mysqli_stmt_bind_param($stmt, "s", $param_username);
            
            // Set parameters
            $param_username = trim($_POST["username"]);
            
            // Attempt to execute the prepared statement
            if(mysqli_stmt_execute($stmt)){
                /* store result */
                mysqli_stmt_store_result($stmt);
                
                if(mysqli_stmt_num_rows($stmt) == 1){
                    $username_err = "This username is already taken.";
                } else{
                    $username = trim($_POST["username"]);
                }
            } else{
                echo "Oops! Something went wrong. Please try again later.";
            }

            // Close statement
            mysqli_stmt_close($stmt);
        }
    }
    
    // Validate password
    if(empty(trim($_POST["password"]))){
        $password_err = "Please enter a password.";     
    } elseif(strlen(trim($_POST["password"])) < 6){
        $password_err = "Password must have atleast 6 characters.";
    } else{
        $password = trim($_POST["password"]);
    }
    
    // Validate confirm password
    if(empty(trim($_POST["confirm_password"]))){
        $confirm_password_err = "Please confirm password.";     
    } else{
        $confirm_password = trim($_POST["confirm_password"]);
        if(empty($password_err) && ($password != $confirm_password)){
            $confirm_password_err = "Password did not match.";
        }
    }
    
    // Check input errors before inserting in database
    if(empty($username_err) && empty($password_err) && empty($confirm_password_err)){
        
        // Prepare an insert statement
        $sql = "INSERT INTO users (username, password) VALUES (?, ?)";
         
        if($stmt = mysqli_prepare($link, $sql)){
            // Bind variables to the prepared statement as parameters
            mysqli_stmt_bind_param($stmt, "ss", $param_username, $param_password);
            
            // Set parameters
            $param_username = $username;

            $param_password = password_hash($password, PASSWORD_DEFAULT); // Creates a password hash
            
            

            // Close statement
            mysqli_stmt_close($stmt);
        }
    }
    
    // Close connection
    mysqli_close($link);
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Sign Up</title>
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.css">
    <style type="text/css">
        body{ font: 14px sans-serif; }
        .wrapper{ width: 350px; padding: 20px; }
    </style>
</head>
<body>
    <div class="wrapper">
        <h2>Sign Up</h2>
        <p>Please fill this form to create an account.</p>
        <form action="<?php echo htmlspecialchars($_SERVER["PHP_SELF"]); ?>" method="post">
            <div class="form-group <?php echo (!empty($first_name_err)) ? 'has-error' : 'hi'; ?>">
                <label>First Name</label>
                <input type="text" name="first_name" class="form-control" value="<?php echo $_POST['first_name']; ?>">
                <span class="help-block"><?php echo $first_name_err; ?></span>
            </div> 
            <div class="form-group <?php echo (!empty($first_name_err)) ? 'has-error' : ''; ?>">
                <label>Last Name</label>
                <input type="text" name="last_name" class="form-control" value="<?php echo $_POST['last_name']; ?>">
                <span class="help-block"><?php echo $last_name_err; ?></span>
            </div> 
            <div class="form-group <?php echo (!empty($first_name_err)) ? 'has-error' : ''; ?>">
                <label>Email</label>
                <input type="text" name="email" class="form-control" value="<?php echo $_POST['email']; ?>">
                <span class="help-block"><?php echo $email_err; ?></span>
            </div> 
            <div class="form-group <?php echo (!empty($username_err)) ? 'has-error' : ''; ?>">
                <label>Username</label>
                <input type="text" name="username" class="form-control" value="<?php echo $username; ?>">
                <span class="help-block"><?php echo $username_err; ?></span>
            </div>   
            <div class="form-group <?php echo (!empty($street_err)) ? 'has-error' : ''; ?>">
                <label>Street</label>
                <input type="text" name="street" class="form-control" value="<?php echo $_POST['street']; ?>">
                <span class="help-block"><?php echo $street_err; ?></span>
            </div> 
            <div class="form-group <?php echo (!empty($city_err)) ? 'has-error' : ''; ?>">
                <label>City</label>
                <input type="text" name="city" class="form-control" value="<?php echo $_POST['city']; ?>">
                <span class="help-block"><?php echo $city_err; ?></span>
            </div> 
            <div class="form-group <?php echo (!empty($zip_code_err)) ? 'has-error' : ''; ?>">
                <label>State</label>
                <input type="text" name="state" class="form-control" value="<?php echo$_POST['state']; ?>">
                <span class="help-block"><?php echo $state_err; ?></span>
            </div>
            <div class="form-group <?php echo (!empty($zip_code_err)) ? 'has-error' : ''; ?>">
                <label>Zip Code</label>
                <input type="text" name="zip_code" class="form-control" value="<?php echo$_POST['zip_code']; ?>">
                <span class="help-block"><?php echo $zip_code_err; ?></span>
            </div>      
            <div class="form-group <?php echo (!empty($password_err)) ? 'has-error' : ''; ?>">
                <label>Password</label>
                <input type="password" name="password" class="form-control" value="<?php echo $password; ?>">
                <span class="help-block"><?php echo $password_err; ?></span>
            </div>
            <div class="form-group <?php echo (!empty($confirm_password_err)) ? 'has-error' : ''; ?>">
                <label>Confirm Password</label>
                <input type="password" name="confirm_password" class="form-control" value="<?php echo $confirm_password; ?>">
                <span class="help-block"><?php echo $confirm_password_err; ?></span>
            </div>
            <div class="form-group">
                <input type="submit" class="btn btn-primary" value="Submit">
                <input type="reset" class="btn btn-default" value="Reset">
            </div>
            
        </form>
    </div>    
</body>
</html>