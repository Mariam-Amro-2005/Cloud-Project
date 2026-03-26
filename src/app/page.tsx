import Image from "next/image";
import Message from "./testMessage";

export default function Home() {
  return (
    <div>
      {/* This is the messaging example with how to get user registration token */}
      <Message />
      <div></div>
    </div>
  );
}
