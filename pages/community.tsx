// Global
import ReactMarkdown from 'react-markdown';
// Scripts
import { getPageInfo, getPartials } from '@/scripts/page-info';
// Interfaces
import { PageInfo, PagePartials } from '@/interfaces/page-info';
// Components
import Layout from '@/components/layout/Layout';
import StackExchangeFeed from '@/components/integrations/stackexchange/StackExchangeFeed';
import TwitterFeed from '@/components/integrations/twitter/TwitterFeed';
import CommunityList from '@/components/lists/CommunityList';
import Container from '@/components/helper/Container';

export async function getStaticProps() {
  const pageInfo = await getPageInfo('community');
  const partials = await getPartials({
    mvpSite: 'community/mvp',
  });

  return {
    props: {
      pageInfo,
      partials,
    },
  };
}

export default function Community({
  pageInfo,
  partials,
}: {
  pageInfo: PageInfo;
  partials: PagePartials;
}) {
  return (
    <Layout pageInfo={pageInfo}>
      <Container>
        <CommunityList />
        <ReactMarkdown>{partials.mvpSite}</ReactMarkdown>
        <TwitterFeed content={pageInfo.twitter} />
        <StackExchangeFeed content={pageInfo.stackexchange} />
      </Container>
    </Layout>
  );
}
