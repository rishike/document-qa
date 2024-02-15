import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import QuestionAnswer from '../components/QuestionAnswer';

function Home() {
  return (
    <>
    <Header />
    <div className="container mx-auto py-4 px-4">
        <QuestionAnswer />
    </div>
    <Footer />
    </>
  );
}

export default Home;

