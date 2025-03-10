import { useState } from "react";

const Upload = () => {
  const [image, setImage] = useState(null);
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const uploadImage = async (e) => {
    const files = e.target.files;
    const data = new FormData();
    data.append("file", files[0]);
    data.append("upload_preset", "socketchat");
    setLoading(true);

    try {
      const res = await fetch(
        "https://api.cloudinary.com/v1_1/drusgejhw/image/upload", // Replace with your cloud name
        {
          method: "POST",
          body: data,
        }
      );
      const file = await res.json();
      setUrl(file.secure_url);
      setLoading(false);
    } catch (error) {
      console.error("Error uploading image:", error);
      setLoading(false);
    }
  };

  return (
    <div>
      <input type="file" onChange={uploadImage} accept="image/*" />
      {loading ? (
        <p>Loading...</p>
      ) : (
        url && <img src={url} alt="Uploaded" style={{ width: "300px" }} />
      )}
    </div>
  );
};

export default Upload;
