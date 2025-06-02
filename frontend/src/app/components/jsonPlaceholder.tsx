"use client";

import { useState } from "react";
import {
  useGetPostsQuery,
  useCreatePostMutation,
} from "../redux/services/jsonPlaceHolderApi";

export default function JsonPlaceholder() {
  const [newPost, setNewPost] = useState({ title: "", body: "" });
  const { data, error, isLoading } = useGetPostsQuery();
  const [createPost, { isLoading: isCreating, error: createError }] = //renaming vars so theyre different from GETPOST var names
    useCreatePostMutation();

  if (isLoading || isCreating) return <p> Loading ... </p>;

  if (createError) return <p> There was an error while creating post</p>;

  if (error) return <p> There was an error :/</p>;

  const handleCreatePost = async () => {
    await createPost(newPost);
  };

  return (
    <div className="">
      <input
        type="text"
        placeholder="title"
        onChange={(e) =>
          setNewPost((prev) => ({ ...prev, title: e.target.value }))
        }
      />
      <input
        type="text"
        placeholder="body"
        onChange={(e) =>
          setNewPost((prev) => ({ ...prev, body: e.target.value }))
        }
      />
      <button onClick={handleCreatePost} disabled={isCreating}>
        Post
      </button>
      {/* <div>
        {data?.map(
          (
            post: any //dont do type any lol
          ) => (
            <p> {post.title}</p>
          )
        )}
      </div> */}
    </div>
  );
}
