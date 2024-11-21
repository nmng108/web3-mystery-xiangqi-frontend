import React from 'react';
import Header from './Header.tsx';
import Footer from './Footer.tsx';

type Props = { children?: React.ReactNode };

const PageContainer: React.FC<Props> = (props) => {
  return (
    <>
      <Header />
      <main className="w-full h-screen bg-main-img bg-cover bg-center bg-fixed"> {/*flex items-center justify-center*/}
        {/*<div className="min-h-screen bg-gray-700 text-gray-900">*/}

        {props.children}
        {/*</div>*/}
      </main>
      <Footer />
    </>
  );
};

export default PageContainer;
