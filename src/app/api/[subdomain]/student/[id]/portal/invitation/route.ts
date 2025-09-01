import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest, { params }: { params: { subdomain: string; id: string } }) {
  try {
    const { subdomain, id } = params
    const body = await request.json()
    const { email, name } = body

    if (!email || !name) {
      return NextResponse.json({
        success: false,
        error: 'Email and name are required'
      }, { status: 400 })
    }

    // Fetch student to verify existence and get agency info
    const student = await db.student.findUnique({
      where: { id },
      include: {
        agency: true
      }
    })

    if (!student) {
      return NextResponse.json({
        success: false,
        error: 'Student not found'
      }, { status: 404 })
    }

    // Generate a random password for the portal
    const generatePassword = () => {
      const length = 12
      const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*"
      let password = ""
      for (let i = 0; i < length; i++) {
        password += charset.charAt(Math.floor(Math.random() * charset.length))
      }
      return password
    }

    const portalPassword = generatePassword()
    const hashedPassword = await bcrypt.hash(portalPassword, 10)

    // Update student with portal access
    const updatedStudent = await db.student.update({
      where: { id },
      data: {
        portalAccess: true,
        portalEmail: email,
        portalPassword: hashedPassword,
        portalInvitationSent: true,
        portalInvitationSentAt: new Date()
      }
    })

    // Send invitation email (simulated - in real implementation, use email service)
    const sendInvitationEmail = async () => {
      // This is a simulation - in a real implementation, you would use:
      // - SendGrid, AWS SES, or another email service
      // - Proper email templates
      // - Queue system for sending emails
      
      const portalLink = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/${subdomain}/student/portal`
      
      const emailContent = `
        Dear ${name},

        You have been granted access to the Student Portal for ${student.agency.name}.
        
        Portal Link: ${portalLink}
        Email: ${email}
        Temporary Password: ${portalPassword}

        Please log in and change your password immediately.

        If you have any questions, please contact your education consultant.

        Best regards,
        ${student.agency.name} Team
      `

      // Simulate email sending
      console.log('=== PORTAL INVITATION EMAIL ===')
      console.log(`To: ${email}`)
      console.log(`Subject: Welcome to ${student.agency.name} Student Portal`)
      console.log(`Body: ${emailContent}`)
      console.log('=== END EMAIL ===')

      // In a real implementation, you would send the email here
      // Example with SendGrid:
      // await sgMail.send({
      //   to: email,
      //   from: 'noreply@eduagency.com',
      //   subject: `Welcome to ${student.agency.name} Student Portal`,
      //   text: emailContent,
      //   html: `<p>${emailContent.replace(/\n/g, '<br>')}</p>`
      // })

      return true
    }

    try {
      await sendInvitationEmail()
    } catch (emailError) {
      console.error('Error sending invitation email:', emailError)
      // Don't fail the whole request if email fails, just log it
    }

    return NextResponse.json({
      success: true,
      message: 'Portal invitation sent successfully',
      student: {
        id: updatedStudent.id,
        firstName: updatedStudent.firstName,
        lastName: updatedStudent.lastName,
        email: updatedStudent.email,
        portalEmail: updatedStudent.portalEmail,
        portalAccess: updatedStudent.portalAccess,
        portalInvitationSent: updatedStudent.portalInvitationSent,
        portalInvitationSentAt: updatedStudent.portalInvitationSentAt
      },
      // In development, return the password for testing
      ...(process.env.NODE_ENV === 'development' && { temporaryPassword: portalPassword })
    })

  } catch (error) {
    console.error('Error sending portal invitation:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to send portal invitation'
    }, { status: 500 })
  }
}