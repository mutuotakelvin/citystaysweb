import Header from "./components/Header";
import Hero from "./components/Hero";
import FeaturedVillas from "./components/FeaturedVillas";
import Destinations from "./components/Destinations";
import WhyCityStays from "./components/WhyCityStays";
import Testimonials from "./components/Testimonials";
import CtaBanner from "./components/CtaBanner";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <FeaturedVillas />
        <Destinations />
        <WhyCityStays />
        <Testimonials />
        <CtaBanner />
      </main>
      <Footer />
    </>
  );
}
