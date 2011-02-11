require 'sinatra'
require 'rest-client'
require 'haml'
require 'json'

MAX_RESULTS = 200

get '/news/:search_term' do |search_term|
  json = RestClient.get("http://query.yahooapis.com/v1/public/yql",
    { :params => {
        :q => %Q(select title,abstract,url,date from search.news(#{MAX_RESULTS}) where query="#{search_term}"),
        :format => 'json',
        # :diagnostics => true
      }
    }
  )
  result = JSON.parse(json)['query']
  news = result['results']['result']

  haml :timeline, :locals => {
    :search_term => search_term,
    :items_found => result['count'],
    :news => news.sort {|a,b| a['date'] <=> b['date']}
  }
end