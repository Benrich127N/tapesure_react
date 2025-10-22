// src/pages/Home.jsx
const Home = () => {
  return (
    <section className="flex flex-col items-center justify-center text-center py-20 px-4">
      <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-4">
        Welcome to <span className="text-blue-600">Tapsure</span>
      </h1>
      <p className="text-lg text-gray-600 max-w-2xl mb-8">
        Tapsure helps you manage your tailoring business with ease — track
        outfits, orders, and clients effortlessly.
      </p>
      <button className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow hover:bg-blue-700 transition">
        Get Started
      </button>
    </section>
  );
};

export default Home;
