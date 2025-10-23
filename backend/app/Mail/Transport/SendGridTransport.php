<?php

namespace App\Mail\Transport;

use Illuminate\Mail\Transport\Transport;
use SendGrid;
use SendGrid\Mail\Mail as SendGridMail;
use SendGrid\Mail\TypeException;
use Swift_Mime_SimpleMessage;

class SendGridTransport extends Transport
{
    /**
     * @var SendGrid
     */
    protected $sendGrid;

    /**
     * Create a new SendGrid transport instance.
     *
     * @param SendGrid $sendGrid
     */
    public function __construct(SendGrid $sendGrid)
    {
        $this->sendGrid = $sendGrid;
    }

    /**
     * {@inheritdoc}
     *
     * @throws TypeException
     */
    public function send(Swift_Mime_SimpleMessage $message, &$failedRecipients = null)
    {
        $email = new SendGridMail();

        $this->setFrom($email, $message);
        $this->setSubject($email, $message);
        $this->setTo($email, $message);
        $this->setCc($email, $message);
        $this->setBcc($email, $message);
        $this->setReplyTo($email, $message);
        $this->setContent($email, $message);
        $this->setAttachments($email, $message);

        $response = $this->sendGrid->send($email);

        // Log response for debugging if needed
        // Log::debug('SendGrid Response: ' . $response->statusCode() . ' - ' . json_encode(json_decode($response->body())));

        return $this->numberOfRecipients($message);
    }

    /**
     * Set the from address on the SendGrid email.
     *
     * @param SendGridMail $email
     * @param Swift_Mime_SimpleMessage $message
     * @throws TypeException
     */
    private function setFrom(SendGridMail $email, Swift_Mime_SimpleMessage $message)
    {
        $from = $message->getFrom();
        
        if (!empty($from)) {
            $fromEmail = array_keys($from)[0];
            $fromName = $from[$fromEmail] ?? null;
            
            $email->setFrom($fromEmail, $fromName);
        }
    }

    /**
     * Set the subject on the SendGrid email.
     *
     * @param SendGridMail $email
     * @param Swift_Mime_SimpleMessage $message
     * @throws TypeException
     */
    private function setSubject(SendGridMail $email, Swift_Mime_SimpleMessage $message)
    {
        $email->setSubject($message->getSubject() ?: '');
    }

    /**
     * Set the to addresses on the SendGrid email.
     *
     * @param SendGridMail $email
     * @param Swift_Mime_SimpleMessage $message
     * @throws TypeException
     */
    private function setTo(SendGridMail $email, Swift_Mime_SimpleMessage $message)
    {
        $to = $message->getTo();
        
        if (!empty($to)) {
            foreach ($to as $toEmail => $toName) {
                $email->addTo($toEmail, $toName);
            }
        }
    }

    /**
     * Set the CC addresses on the SendGrid email.
     *
     * @param SendGridMail $email
     * @param Swift_Mime_SimpleMessage $message
     * @throws TypeException
     */
    private function setCc(SendGridMail $email, Swift_Mime_SimpleMessage $message)
    {
        $cc = $message->getCc();
        
        if (!empty($cc)) {
            foreach ($cc as $ccEmail => $ccName) {
                $email->addCc($ccEmail, $ccName);
            }
        }
    }

    /**
     * Set the BCC addresses on the SendGrid email.
     *
     * @param SendGridMail $email
     * @param Swift_Mime_SimpleMessage $message
     * @throws TypeException
     */
    private function setBcc(SendGridMail $email, Swift_Mime_SimpleMessage $message)
    {
        $bcc = $message->getBcc();
        
        if (!empty($bcc)) {
            foreach ($bcc as $bccEmail => $bccName) {
                $email->addBcc($bccEmail, $bccName);
            }
        }
    }

    /**
     * Set the reply to addresses on the SendGrid email.
     *
     * @param SendGridMail $email
     * @param Swift_Mime_SimpleMessage $message
     * @throws TypeException
     */
    private function setReplyTo(SendGridMail $email, Swift_Mime_SimpleMessage $message)
    {
        $replyTo = $message->getReplyTo();
        
        if (!empty($replyTo)) {
            foreach ($replyTo as $replyToEmail => $replyToName) {
                $email->setReplyTo($replyToEmail, $replyToName);
                break;  // SendGrid only supports one reply-to address
            }
        }
    }

    /**
     * Set the contents on the SendGrid email.
     *
     * @param SendGridMail $email
     * @param Swift_Mime_SimpleMessage $message
     * @throws TypeException
     */
    private function setContent(SendGridMail $email, Swift_Mime_SimpleMessage $message)
    {
        $contentType = $message->getContentType();
        
        if (strpos($contentType, 'multipart') !== false) {
            // Handle multipart content
            $htmlPart = $plainPart = null;
            
            foreach ($message->getChildren() as $child) {
                $childType = $child->getContentType();
                
                if ($childType === 'text/html' || strpos($childType, 'text/html') !== false) {
                    $htmlPart = $child->getBody();
                } elseif ($childType === 'text/plain' || strpos($childType, 'text/plain') !== false) {
                    $plainPart = $child->getBody();
                }
            }
            
            if ($htmlPart) {
                $email->addContent('text/html', $htmlPart);
            }
            
            if ($plainPart) {
                $email->addContent('text/plain', $plainPart);
            }
        } else {
            // Handle single content
            if ($contentType === 'text/plain' || strpos($contentType, 'text/plain') !== false) {
                $email->addContent('text/plain', $message->getBody());
            } else {
                $email->addContent('text/html', $message->getBody());
            }
        }
    }

    /**
     * Set the attachments on the SendGrid email.
     *
     * @param SendGridMail $email
     * @param Swift_Mime_SimpleMessage $message
     * @throws TypeException
     */
    private function setAttachments(SendGridMail $email, Swift_Mime_SimpleMessage $message)
    {
        foreach ($message->getChildren() as $attachment) {
            if ($attachment instanceof \Swift_Attachment) {
                $email->addAttachment(
                    base64_encode($attachment->getBody()),
                    $attachment->getContentType(),
                    $attachment->getFilename(),
                    'attachment'
                );
            }
        }
    }
}