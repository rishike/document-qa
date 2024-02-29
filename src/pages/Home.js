import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
// import QuestionAnswer from '../components/QuestionAnswer';
import Chatbot from '../components/ChatBot';

function Home() {
  return (
    <>
    <Header />
    <div className="container mx-auto py-4 px-4">
        {/* <QuestionAnswer /> */}
        <Chatbot />
    </div>
    <Footer />
    </>
  );
}

export default Home;

