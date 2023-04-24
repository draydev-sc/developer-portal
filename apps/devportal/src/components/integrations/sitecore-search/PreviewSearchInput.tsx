import { GetProductLogo } from '@/../../packages/ui/common/assets';
import { truncateString } from '@/../../packages/ui/common/text-util';
import { ActionPropPayload, ItemActionPayload, PreviewSearchSuggestionQuery, SearchResponseSuggestion, WidgetActionPayload, WidgetDataType, usePreviewSearch, widget } from '@sitecore-search/react';
import { ArticleCard, NavMenu, Presence } from '@sitecore-search/ui';
import type { PreviewSearchActionProps } from '@sitecore-search/widgets';
import Image from 'next/image';
import { SyntheticEvent, useCallback, useState } from 'react';
import Loader from './Loader';

type ArticleModel = {
  id: string;
  name: string;
  image_url: string;
  url: string;
  source_id: string;
  type: string;
  index_name: string;
  description: string;
  site_name: string;
};

const Articles = ({ loading = false, articles, onItemClick }: { loading?: boolean; articles: Array<ArticleModel>; onItemClick: PreviewSearchActionProps['onItemClick'] }) => (
  <NavMenu.Content className="bg-theme-bg text-theme-text absolute top-0 inline-block h-full overflow-y-auto">
    <Presence present={loading}>
      <Loader />
    </Presence>
    <NavMenu.List className="mr-0 grid list-none grid-cols-3 gap-0 p-0">
      {!loading &&
        articles.map((article, index) => (
          <NavMenu.Item key={`${article.id}@${article.source_id}`} className="m-4 inline">
            <NavMenu.Link
              className="box-border inline-block w-full no-underline"
              href={article.url}
              onClick={(e) => {
                e.preventDefault();
                onItemClick({ id: article.id || '', index: index });
                // add redirection or any action
              }}
            >
              <ArticleCard.Root className="bg-theme-bg grid grid-cols-4 items-center md:flex-row">
                <div className={`${article.type == 'Video' ? 'col-span-3' : 'col-span-4'} pr-2`}>
                  <ArticleCard.Title className="mt-2 text-base font-bold group-hover:underline">{article.name}</ArticleCard.Title>
                  {article.type && <span className="bg-primary-500 text-2xs px-2.5 py-1 uppercase text-white dark:bg-teal-500">{article.type}</span>}
                  {article.index_name && <span className="text-2xs mr-2 px-2.5 py-1 uppercase">{article.site_name}</span>}
                  {article.description && <p className="text-sm">{truncateString(article.description, 300, true)}</p>}
                </div>
                {article.type == 'Video' && (
                  <div className="col-span-1">
                    {article.image_url && <Image width={256} height={144} src={article.image_url} alt={article.index_name} className="mt-20 object-scale-down" />}
                    {!article.image_url && <Image width={256} height={144} src="/images/social/social-card-default.jpeg" alt={article.index_name} className="mt-20 object-scale-down" />}
                  </div>
                )}
              </ArticleCard.Root>
              <span className="text-violet mt-1 block break-words text-xs italic dark:text-white">{article.url}</span>
            </NavMenu.Link>
          </NavMenu.Item>
        ))}
    </NavMenu.List>
  </NavMenu.Content>
);

interface SearchItemActionPayload extends ItemActionPayload {
  payload: WidgetActionPayload;
  type: string;
}

const Group = ({
  groupTitle,
  groupId,
  filterAttribute,
  articles,
  activeItem,
  onActiveItem,
  onItemClick,
}: {
  groupTitle: string;
  groupId: string;
  filterAttribute?: string;
  articles: Array<SearchResponseSuggestion>;
  activeItem: string;
  onActiveItem: (arg: string) => void;
  onItemClick: (payload: ActionPropPayload<SearchItemActionPayload>) => void;
}) => {
  return (
    <>
      <h2>{groupTitle}</h2>
      {articles.map(({ text }) => (
        <NavMenu.Item value={getGroupId(groupId, text)} key={text}>
          <NavMenu.Trigger
            onMouseOver={(e) => {
              const target = e.target as HTMLLinkElement;
              target.focus();
            }}
            onFocus={() => onActiveItem(getGroupId(groupId, text))}
          >
            {text}
          </NavMenu.Trigger>
          <PreviewSearchSuggestionQuery<ArticleModel> active={activeItem === getGroupId(groupId, text)} value={text} filterAttribute={filterAttribute}>
            {({ queryResult: { isFetching, data: { content: articles = [] } = {} } }) => <Articles loading={isFetching} articles={articles} onItemClick={onItemClick} />}
          </PreviewSearchSuggestionQuery>
        </NavMenu.Item>
      ))}
    </>
  );
};

const getGroupId = (name: string, value: string) => `${name}@${value}`;

const PreviewSearchInput = ({ defaultProductsPerPage = 6 }) => {
  const {
    context: { itemsPerPage = defaultProductsPerPage, keyphrase = '' },
    actions: { onItemClick, onKeyphraseChange },
    queryResult: {
      isFetching,
      isLoading,
      data: {
        content: articles = [],
        suggestion: {
          title_context_aware: articleSuggestions = [],
          // content_trending_category: trendingCategorySuggestions = [],
        } = {},
      } = {},
    },
  } = usePreviewSearch<ArticleModel>(() => {
    return {
      suggestionsList: [
        { suggestion: 'name_suggester', max: 10 },
        // { suggestion: 'content_trending_category', max: 10 },
      ],
      itemsPerPage,
    };
  });

  const loading = isLoading || isFetching;
  const [activeItem, setActiveItem] = useState('defaultArticlesResults');
  const [value, setValue] = useState('');
  const onValueChange = (newValue: string) => {
    setValue(newValue);
  };

  const keyphraseHandler = useCallback(
    (event: KeyboardEvent) => {
      const target = event.target as HTMLInputElement;
      if (keyphrase !== target.value) {
        onKeyphraseChange({ keyphrase: target.value });
      }
    },
    [onKeyphraseChange, keyphrase]
  );

  //const navigate = useNavigate();
  const handleSubmit = (e: SyntheticEvent): void => {
    e.preventDefault();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const target = e.target.query as HTMLInputElement;
    setValue('');
    // navigate(`/search?q=${target.value}`);
  };

  return (
    <NavMenu.Root onValueChange={onValueChange} value={value}>
      <NavMenu.List>
        <NavMenu.Item>
          <form onSubmit={handleSubmit}>
            <div className="relative flex w-full flex-row items-center">
              <label className="sr-only">Search:</label>
              <span aria-hidden="true" className="absolute left-4 z-20">
                <svg width="16px" height="16px" viewBox="0 0 16 16" version="1.1" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M15.1836415,15.8898446 L15.8898446,15.1836415 C16.0367185,15.0367676 16.0367185,14.7992609 15.8898446,14.6524176 L12.0962687,10.8588417 C12.0244033,10.7869763 11.9306579,10.749472 11.8306567,10.749472 L11.4182014,10.749472 C12.4025281,9.60890307 12.9993615,8.12460097 12.9993615,6.49968077 C12.9993615,2.90921991 10.0901416,0 6.49968077,0 C2.90921991,0 0,2.90921991 0,6.49968077 C0,10.0901416 2.90921991,12.9993615 6.49968077,12.9993615 C8.12460097,12.9993615 9.60890307,12.4025281 10.749472,11.4182014 L10.749472,11.8306567 C10.749472,11.9306579 10.7900889,12.0244033 10.8588417,12.0962687 L14.6524176,15.8898446 C14.7992609,16.0367185 15.0367676,16.0367185 15.1836415,15.8898446 Z M6.49968077,11.4994352 C3.73730424,11.4994352 1.49992633,9.26205731 1.49992633,6.49968077 C1.49992633,3.73730424 3.73730424,1.49992633 6.49968077,1.49992633 C9.26205731,1.49992633 11.4994352,3.73730424 11.4994352,6.49968077 C11.4994352,9.26205731 9.26205731,11.4994352 6.49968077,11.4994352 Z"
                    fill="currentColor"
                  />
                </svg>
              </span>
              <NavMenu.InputTrigger
                className="bg-theme-bg text-theme-text border-theme-border rounded-smz-10 w-full border px-4 py-2 pl-12 text-sm"
                name="query"
                onKeyUp={keyphraseHandler}
                placeholder="What are you looking for?"
                onFocus={() => {
                  if (keyphrase.length > 0) {
                    setActiveItem('defaultArticlesResults');
                  }
                }}
                autoComplete="off"
              />
              <span className="absolute right-4 z-20 opacity-50">
                <span className="text-sm"> Powered by </span>
                <Image src={GetProductLogo('Search', 'Light')} alt="Powered by" className="relative inline dark:hidden" width="70" height="30" />
                <Image src={GetProductLogo('Search', 'Dark')} alt="Powered by" className="relative hidden dark:inline" width="70" height="30" />
              </span>
            </div>
          </form>

          <NavMenu.Content className="bg-theme-bg text-theme-text absolute left-0 top-10 inline-block h-72 w-full justify-center pt-0 shadow-md">
            <Presence present={loading}>
              <Loader />
            </Presence>
            {!loading && (
              <NavMenu.SubContent orientation="vertical" value={activeItem} className="relative box-border block h-full w-full">
                <NavMenu.List className="w-full">
                  {articleSuggestions.length > 0 && <Group groupTitle="Suggestions" groupId="keyphrase" articles={articleSuggestions} onItemClick={onItemClick} activeItem={activeItem} onActiveItem={setActiveItem} />}
                  <NavMenu.Item value="defaultArticlesResults" key="defaultArticlesResults" className="b-0 h-72 overflow-hidden bg-none">
                    <NavMenu.Trigger aria-hidden className="hidden" />
                    <Articles articles={articles} onItemClick={onItemClick} />
                  </NavMenu.Item>
                </NavMenu.List>
              </NavMenu.SubContent>
            )}
          </NavMenu.Content>
        </NavMenu.Item>
      </NavMenu.List>
    </NavMenu.Root>
  );
};

const PreviewSearchInputWidget = widget(PreviewSearchInput, WidgetDataType.PREVIEW_SEARCH, 'content');
export default PreviewSearchInputWidget;
