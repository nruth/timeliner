require 'sinatra'
require 'rest-client'
require 'haml'
require 'json'

DEFAULT_QUERY_SIZE = 100

get '/news/:search_term' do |search_term|
  result = Timeline.query_yql %Q(select title,abstract,url,date from search.news(#{MAX_result}) where query="#{search_term}")
  news = result['results']['result']

  haml :'news/timeline', :locals => {
    :search_term => search_term,
    :items_found => result['count'],
    :news => news.sort {|a,b| a['date'] <=> b['date']}
  }
end

get '/papers/:search_term' do |search_term|
  item_count = params['results'] || DEFAULT_QUERY_SIZE
  result = Timeline.query_yql %Q(select * from mendeley.search where query="#{search_term}" and items="#{item_count}")
  papers = result['results']['json']['documents']

  haml :'papers/timeline', :locals => {
    :search_term => search_term,
    :items_found => "#{result['items_per_page']} of #{result['total_result']} (page #{result['current_page']} of #{result['total_pages']})",
    :papers => papers.sort {|b,a| a['year'] <=> b['year']}
  }
end

module Timeline
  # queries yql and returns a hashmap of the result
  def self.query_yql(query)
    json = RestClient.get("http://query.yahooapis.com/v1/public/yql",
      { :params => {
          :q => query,
          :format => 'json',
          :env => 'store://datatables.org/alltableswithkeys'
        }
      }
    )
    JSON.parse(json)['query']
  end
end