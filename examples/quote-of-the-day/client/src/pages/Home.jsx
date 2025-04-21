// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import React from "react";
import { useState, useEffect, useContext } from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { AppContext } from "./AppContext";

function Home() {
  const { featureManager, currentUser } = useContext(AppContext);
  const [liked, setLiked] = useState(false);
  const [message, setMessage] = useState(undefined);

  useEffect(() => {
    const init = async () => {
      const response = await fetch(
        `/api/getGreetingMessage?userId=${currentUser ?? ""}`,
        {
          method: "GET",
        }
      );
      if (response.ok) {
        const result = await response.json();
        setMessage(result.message ?? "Quote of the Day"); // default message is "Quote of the Day"
      } else {
        console.error("Failed to get greeting message.");
      }
      setLiked(false);
    };

    init();
  }, [featureManager, currentUser]);

  const handleClick = async () => {
    if (!liked) {
      try {
        const response = await fetch("/api/like", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ UserId: currentUser ?? "" }),
        });

        if (response.ok) {
          console.log("Like the quote successfully.");
        } else {
          console.error("Failed to like the quote.");
        }
      } catch (error) {
        console.error("Error:", error);
      }
    }
    setLiked(!liked);
  };

  return (
    <div className="quote-card">
      { message != undefined ?
        ( 
        <>
          <h2>
            <>{message}</>
          </h2>
          <blockquote>
            <p>"You cannot change what you are, only what you do."</p>
            <footer>— Philip Pullman</footer>
          </blockquote>
          <div className="vote-container">
            <button className="heart-button" onClick={handleClick}>
              {liked ? <FaHeart /> : <FaRegHeart />}
            </button>
          </div>
        </> 
        ) 
        : <p>Loading</p>       
      }
    </div>
  );
}

export default Home;