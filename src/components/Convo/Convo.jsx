import React, { useEffect, useRef } from "react";

function SentMessage({ text, time }) {
  return (
    <div className="message own max-w-[70%] self-end flex flex-col items-end">
      <div className="bg-[#5183fe] p-4 text-white rounded-lg shadow-md transition-shadow hover:shadow-lg">
        <p>{text}</p>
      </div>
      <span className="text-xs text-gray-400 mt-1">{time}</span>
    </div>
  );
}

function ReceivedMessage({ avatar, image, text, time }) {
  return (
    <div className="message max-w-[70%] flex gap-3">
      <img
        src={avatar}
        alt="Sender Avatar"
        className="w-8 h-8 object-cover rounded-full"
      />
      <div className="flex flex-col">
        {image && (
          <img
            src={image}
            alt="Attached Content"
            className="w-full max-h-60 rounded-lg object-cover mb-2 shadow-sm"
          />
        )}
        <div className="bg-[#1119284d] p-4 rounded-lg text-white shadow-md transition-shadow hover:shadow-lg">
          <p>{text}</p>
        </div>
        <span className="text-xs text-gray-400 mt-1">{time}</span>
      </div>
    </div>
  );
}

function Convo() {
  return (
    <div className="p-5 flex-1 overflow-y-auto flex flex-col gap-5 bg-[#1F2937]">
      {/* Example Messages */}
      <SentMessage
        text="Lorem ipsum dolor sit amet consectetur adipisicing elit. Exercitationem repellat nesciunt hic nisi id nihil vitae accusamus rerum, pariatur doloribus, autem eligendi, vero recusandae dignissimos necessitatibus obcaecati quia minima atque."
        time="1 Minute ago"
      />
      <ReceivedMessage
        avatar="./avatar.png"
        image="./bg.jpg"
        text="Lorem ipsum dolor sit amet consectetur adipisicing elit. Exercitationem repellat nesciunt hic nisi id nihil vitae accusamus rerum, pariatur doloribus, autem eligendi, vero recusandae dignissimos necessitatibus obcaecati quia minima atque."
        time="1 Minute ago"
      />
      <div ref={endRef}></div>
    </div>
  );
}

export default Convo;
