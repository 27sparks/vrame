class NewsletterMailer < ActionMailer::Base
  def newsletter(newsletter, recipient)
    recipients    recipient.email
    from          Vrame::Mailer.options[:from]
    subject       newsletter.title_for(recipient)
    sent_on       Time.now
    content_type  "multipart/alternative"
    
    part "text/plain" do |p|
      p.body = newsletter.body_plain_text_for(recipient)
    end
    
    part "text/html" do |p|
      p.body = newsletter.body_for(recipient)
    end
  end
  
  def confirmation_request(recipient)    
    recipients    recipient.email
    from          Vrame::Mailer.options[:from]
    subject       Vrame::Mailer.options[:subjects][:confirmation]
    sent_on       Time.now
    content_type  "multipart/alternative"
    
    part :content_type => "text/plain", :body => render_message("confirmation_request.plain", :recipient => recipient)
    part :content_type => "text/html", :body => render_message("confirmation_request.html", :recipient => recipient)
  end
  
  def welcome_message(recipient)
    recipients    recipient.email
    from          Vrame::Mailer.options[:from]
    subject       Vrame::Mailer.options[:subjects][:welcome]
    sent_on       Time.now
    content_type  "multipart/alternative"
    
    part :content_type => "text/plain", :body => render_message("welcome_message.plain", :recipient => recipient)
    part :content_type => "text/html", :body => render_message("welcome_message.html", :recipient => recipient)
  end
  
  def unsubscribe_message(recipient)
    recipients    recipient.email
    from          Vrame::Mailer.options[:from]
    subject       Vrame::Mailer.options[:subjects][:unsubscribe]
    sent_on       Time.now
    content_type  "multipart/alternative"
    
    part :content_type => "text/plain", :body => render_message("unsubscribe_message.plain", :recipient => recipient)
    part :content_type => "text/html", :body => render_message("unsubscribe_message.html", :recipient => recipient)
  end
end