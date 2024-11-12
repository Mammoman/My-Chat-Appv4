import { auth, provider } from "../../config/firebase.js";
import { signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import React, { useState, useEffect } from "react";
import Cookies from 'universal-cookie';
import { ArrowRightDoubleIcon, CircleArrowDown02Icon, GoogleIcon } from "hugeicons-react";
import '../../styles/auth/Auth.css'

const cookies = new Cookies();

export const Auth = (props) => {
    const { setIsAuth } = props;

    // State for email and password
    const [email, setEmail] = useState("");
    const [name, setNamme] = useState("");
    const [password, setPassword] = useState("");
    const [isSignUp, setIsSignUp] = useState(false); // State to toggle between sign up and sign in

    const handleGoogleSignIn = async () => {
        try {
            const result = await signInWithPopup(auth, provider);
            cookies.set("auth-token", result.user.refreshToken);
            setIsAuth(true);
        } catch (err) {
            console.error("Google Sign-In Error:", err);
            alert("Failed to sign in with Google. Please try again.");
        }
    };

    const handleEmailPasswordSignIn = async (e) => {
        e.preventDefault();
        try {
                // Sign in with email and password
                const result = await signInWithEmailAndPassword(auth, email, password);
                cookies.set("auth-token", result.user.refreshToken);
            setIsAuth(true);
        } catch (err) {
            console.error(err);
        }
    };

    const handleEmailPasswordSignUp = async (e) => {
        e.preventDefault(); // Prevent default form submission
        try {
            // Sign up with email and password
            const result = await createUserWithEmailAndPassword(auth, email, password);
            cookies.set("auth-token", result.user.refreshToken);
            setIsAuth(true); // Set authentication state to true
        } catch (err) {
            console.error("Sign Up Error:", err);
            let errorMessage = "Failed to create an account. Please try again.";
            if (err.code === 'auth/invalid-email') {
                errorMessage = "The email address is not valid.";
            } else if (err.code === 'auth/email-already-in-use') {
                errorMessage = "The email address is already in use.";
            } else if (err.code === 'auth/weak-password') {
                errorMessage = "The password is too weak.";
            }
            alert(errorMessage);
        }
    };

    const handleSignUpClick = () => {
        setIsSignUp(true);
        const container = document.getElementById('container');
        container.classList.add("right-panel-active");
    };

    const handleSignInClick = () => {
        setIsSignUp(false);
        const container = document.getElementById('container');
        container.classList.remove("right-panel-active");
    };

    useEffect(() => {
        const signUpButton = document.getElementById('signUp');
        const signInButton = document.getElementById('signIn');
        const container = document.getElementById('container');

        signUpButton.addEventListener('click', () => {
            container.classList.add("right-panel-active");
        });

        signInButton.addEventListener('click', () => {
            container.classList.remove("right-panel-active");
        });

        // Cleanup event listeners on component unmount
        return () => {
            signUpButton.removeEventListener('click', () => {
                container.classList.add("right-panel-active");
            });
            signInButton.removeEventListener('click', () => {
                container.classList.remove("right-panel-active");
            });
        };
    }, []);
    return (
        <div className="container" id="container">
            <div className={`form-container ${isSignUp ? "sign-up-container" : "sign-in-container"}`}>
                {isSignUp ? (
                    <form className="form-container-create" onSubmit={handleEmailPasswordSignUp}>
                        <h1>Create Account</h1>
                        <div className="social-container">
                        <span>or use your email for registration</span>
                          <ArrowRightDoubleIcon/>
                            <GoogleIcon size={44} onClick={handleEmailPasswordSignUp} />
                        </div>
                        
                        <input type="text" placeholder="Name" required />
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <button type="submit" onClick={handleEmailPasswordSignUp}>Sign Up</button>
                    </form>
                ) : (
                    <form className="form-container" onSubmit={handleEmailPasswordSignIn}>
                        <h1>Sign in</h1>
                        <div className="social-container">
                            <GoogleIcon size={44} onClick={handleGoogleSignIn} />
                        </div>
                        <span>or use your account</span>
                        <input
                            className="form-container-input"
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <button type="submit">Sign In</button>
                        <a href="#">Forgot your password?</a>
                    </form>
                )}
            </div>

            <div className="overlay-container">
                <div className="overlay">
                    <div className="overlay-panel  overlay-right">
                        <h1>Welcome Back!</h1>
                        <p>To keep connected with us please login with your personal info</p>
                        <p>First Time User ?</p>
                        <CircleArrowDown02Icon />
                        <button className="ghost" id="signUp" onClick={handleSignUpClick}>Sign Up</button>
                    </div>
                    <div className="overlay-panel overlay-left">
                        <h1>Hello, Friend!</h1>
                        <p>Enter your personal details and start your journey with us</p>
                        <p>Already a user?</p>
                        <CircleArrowDown02Icon />
                        <button className="ghost" id="signIn" onClick={handleSignInClick}>Sign In</button>  
                    </div>
                </div>
            </div>
        </div>
    );
};

