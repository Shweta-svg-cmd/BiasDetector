import { Helmet } from 'react-helmet';
import InputSection from '@/components/InputSection';
import MethodologySection from '@/components/MethodologySection';
import RecentHistory from '@/components/RecentHistory';

const Home = () => {
  return (
    <>
      <Helmet>
        <title>NewsLens | Media Bias Detection & Analysis</title>
        <meta name="description" content="Analyze news articles for bias, get a neutrality score, and compare with other major news sources on the same topic." />
      </Helmet>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <InputSection />
        <RecentHistory />
        <MethodologySection />
      </main>
    </>
  );
};

export default Home;
