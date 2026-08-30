# Contact form

The form on `contact.html` posts to Web3Forms, which emails the inquiry on. GitHub Pages
serves static files and cannot process a submission itself, so a service has to receive it.

## Connecting it

The access key lives in one place: the `data-access-key` attribute on the form in
`contact.html`.

    <form class="contact-form" id="contact-form" data-access-key="YOUR-KEY-HERE" novalidate>

Until a real key is in there, the form validates normally but tells the visitor it is not
connected yet and gives them the phone number. It never fails silently.

The key is not a password. It sits in the page source where anyone can read it. The worst
someone can do with it is send you unwanted mail, which is what the honeypot and Web3Forms'
spam filtering are for.

## Changing where inquiries go

Web3Forms ties an access key to the email address that created it. To move submissions from
`hello@design-kings.com` to the client:

1. Create a new form in the Web3Forms dashboard under the client's email
2. Replace `data-access-key` in `contact.html` with the new key
3. Commit and push

Send a test inquiry after switching. It is the only way to know it landed.

## What gets sent

Name, email, phone, city/county and the message, plus a fixed subject line
("New website inquiry | Simpson & Gardner") so it filters cleanly in a busy inbox. Replying
to the notification goes to the visitor, not to Web3Forms.

Name, email and message are required. Phone and city are optional, deliberately: every
required field costs you inquiries.

## Where the leads live

**Email only.** Web3Forms' own documentation contradicts itself on whether submissions are
stored, so treat the notification email as the sole record. If an email is deleted, that
lead is gone.

This is the obvious next thing to improve. Web3Forms supports webhooks on its paid tiers,
which could post each inquiry straight into the DesignKings Client Dashboard as a new
ticket. Worth doing before this pattern gets rolled out across client sites.

## Free plan limits

250 submissions a month, permanently free. Domain restriction, which would stop someone
lifting the key for their own site, is a paid feature. At this volume it does not matter.

## Testing it

1. Open the contact page and submit with fields empty. Each required field should show its
   own message and nothing should send.
2. Enter a malformed email. It should be caught before sending.
3. Send a real one. The form should be replaced by a thank-you, and the mail should arrive
   within a minute. Check spam on the first send.
