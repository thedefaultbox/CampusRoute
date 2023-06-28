import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react";

import styles from "../App.module.css";

import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import "firebase/compat/auth";

import { useAuthState } from "react-firebase-hooks/auth";
import { fetchSignInMethodsForEmail } from "firebase/auth";
import { updateProfile, updateEmail } from "firebase/auth";

firebase.initializeApp({
    apiKey: "AIzaSyAeeTvV_czzoX_qxVOgRMxrE1aNEo6SMgQ",
    authDomain: "campusroute-ca268.firebaseapp.com",
    projectId: "campusroute-ca268",
    storageBucket: "campusroute-ca268.appspot.com",
    messagingSenderId: "164037552565",
    appId: "1:164037552565:web:e64461bee2e260d57191fc",
    measurementId: "G-7GN7W7HW1C",
});

const auth = firebase.auth();
const firestore = firebase.firestore();

export function Settings() {
    const [user] = useAuthState(auth);
    const [newName, setNewName] = useState(user.displayName);
    const [newEmail, setNewEmail] = useState(user.email);

    const handleSave = async () => {
        try {
            const docRef = firestore.collection("users").doc(user.uid);
            await docRef.update({
                userNAME: newName,
                userEMAIL: newEmail,
            });
            console.log("User information updated successfully");

            const currentUser = auth.currentUser;
            if (newName !== currentUser.displayName) {
                await updateProfile(currentUser, { displayName: newName });
                console.log("User name updated successfully.");
            }
            if (newEmail !== currentUser.email) {
                await updateEmail(currentUser, newEmail);
                console.log("User email updated successfully.");
            }
        } catch (error) {
            console.error("Error updating user information", error);
        }
    };

    const handleLogout = () => {
        auth.signOut()
            .then(() => {
                console.log("User logged out");
            })
            .catch((error) => {
                console.error("Error logging out", error);
            });
    };

    const handleDeleteAccount = async () => {
        try {
            await firestore.collection("users").doc(user.uid).delete();
            await auth.currentUser.delete();
            console.log("User account deleted successfully");
        } catch (error) {
            console.error("Error deleting user account", error);
        }
    };

    const handleDataExport = async () => {
        try {
            const userDataSnapshot = await firestore
                .collection("users")
                .doc(user.uid)
                .get();
            const userData = userDataSnapshot.data();

            const userDataBlob = new Blob([JSON.stringify(userData)], {
                type: "application/json",
            });
            const userDataURL = URL.createObjectURL(userDataBlob);

            const downloadLink = document.createElement("a");
            downloadLink.href = userDataURL;
            downloadLink.download = `userdata_${user.uid}.json`;
            downloadLink.click();

            URL.revokeObjectURL(userDataURL);
        } catch (error) {
            console.error("Error exporting user data", error);
        }
    };

    return (
        <div className={`${styles["app-box"]} ${styles["settings"]}`}>
            <h2>Account Settings</h2>

            <div className={styles["settings-edit"]}>
                <div className={styles["settings-edit-input"]}>
                    <h4>Name:</h4>
                    <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                    />
                </div>

                <div className={styles["settings-edit-input"]}>
                    <h4>Email:</h4>
                    <input
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                    />
                </div>
                <button
                    className={`${styles["settings-button"]} ${styles["save"]}`}
                    onClick={handleSave}
                >
                    Update
                </button>
            </div>

            <button
                className={`${styles["settings-button"]} ${styles["danger"]}`}
                onClick={handleLogout}
            >
                Logout
            </button>
            <button
                className={`${styles["settings-button"]} ${styles["danger"]}`}
                onClick={handleDeleteAccount}
            >
                Delete Account
            </button>

            <button
                className={styles["settings-button"]}
                onClick={handleDataExport}
            >
                Request Data Export
            </button>
        </div>
    );
}
