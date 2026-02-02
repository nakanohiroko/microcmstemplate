import PostRecent from '@/components/organisms/postRecent'
import Pagination from '@/components/molecules/pagination'
import Sidebar from '@/components/organisms/sidebar'
import TitleMV from '@/components/organisms/titleMV'
import { defaultSettings } from '@/contants/defaultSettings'
import getData from '@/utils/getData'
import { ResolvingMetadata } from 'next'
import Error from '@/app/error'

type Props = {
  params: Promise<{
    slug: string
  }>
  searchParams: Promise<{
    q?: string
  }>
}

/** MetaData */
export async function generateMetadata({params, searchParams}: Props, parent: ResolvingMetadata) {
  const settingsEndpoint = 'settings/'
  const settingsData = await getData(settingsEndpoint)
  const parentData = await(parent)
  const previousPreview = parentData.openGraph?.images || []
  const favicon = settingsData.favicon
  const faviconUrl = favicon ? favicon.url : '/images/favicon.ico'
  const { q } = await searchParams

  // Title & description
  let titlePage = `《${q}》の検索結果`
  let description = `《${q}》の検索結果ページです。`
  let siteName = `| ${settingsData.siteName}`
  if (settingsData.status === 401) {
    titlePage = defaultSettings.serverError
    description = ''
    siteName = ''
  }
  const title = `${titlePage} ${siteName}`

  return {
    title: title,
    description: description,
    openGraph: {
      title: title,
      images: [...previousPreview],
      type: 'article',
    },
    icons: {
      icon: [
        {
          url: faviconUrl,
          href: faviconUrl,
        }
      ]
    }
  }
}

async function SearchPage({ params, searchParams }: Props) {
  const { q } = await searchParams

  /** Get data */
  const paramQuery = q
  const settingsData = await getData('settings/')
  
  const fields = defaultSettings.queryFields
  const postLimit = settingsData.postLimit || defaultSettings.postLimit
  const limitOffset = `limit=${postLimit}&offset=${0}`
  const query = `q=${paramQuery}`
  const postsEndpoint = `blogs?${query}&${fields}&${limitOffset}`
  const postsData = await getData(postsEndpoint)

  // [MICROCMS_API_KEY] not valid
  if (postsData.status === 401) {
    return <Error />
  }
  
  return (
    <>
      <TitleMV title={'検索'} description={paramQuery} /> 
      <div className="main__wrapper page--search">
        <div className="main__container container">
          <div className="main__inner">
            <div className="main__content">
              <PostRecent articles={postsData.contents} />
              <Pagination totalCount={postsData.totalCount} basePath={'/search'} q={paramQuery} />
            </div>
            <Sidebar />
          </div>
        </div>
      </div>
    </>
  )
}

export default SearchPage
