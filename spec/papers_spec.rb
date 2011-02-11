require File.dirname(__FILE__) + '/spec_helper'

set :environment, :test

describe '/papers/watermarking' do
  include Rack::Test::Methods

  def app
    Sinatra::Application
  end

  let(:empty_mendley_result) do
    { 'results' => {'json' => {'documents' => []} }}
  end

  it "queries YQL mendeley for watermarking, default 100 items" do
    Timeline.should_receive(:query_yql).with(
      %Q(select * from mendeley.search where query="watermarking" and items="100")
    ).and_return(empty_mendley_result)
    get subject
  end
  
  describe "?results=205" do
    it "should ask for 205 search results" do
      Timeline.should_receive(:query_yql).with(
        %Q(select * from mendeley.search where query="watermarking" and items="205")
      ).and_return(empty_mendley_result)
      get '/papers/watermarking?results=205'
    end
  end
end
