import mailTransporter from '@/configs/mail-transporter'

// Hàm gửi email tổng quát
export async function sendEmail({ to, subject, html }) {
    const info = await mailTransporter.sendMail({
        from: `"Hệ thống mượn thiết bị" <${process.env.MAIL_USERNAME}>`,
        to,
        subject,
        html,
    })

    console.log(`Email sent to ${to}:`, info.messageId)
}

// Gửi OTP xác thực (reset mật khẩu)
export async function sendOtp(user, otp) {
    if (!user?.email) throw new Error('Người dùng không có email để gửi OTP.')

    const html = `<p>Mã OTP của bạn là: <strong>${otp}</strong>. Mã có hiệu lực trong 5 phút.</p>`

    await sendEmail({
        to: user.email,
        subject: 'Mã xác thực OTP',
        html
    })
}

// Gửi email khi yêu cầu được duyệt
export async function sendRequestApprovedEmail(user, device, quantity, returnDate) {
    if (!user?.email) return

    const date = new Date(returnDate)
    const formattedDate = date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    })
    const formattedTime = date.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    })
    const formattedReturnDate = `${formattedTime} ${formattedDate}`

    const html = `
        <p>Xin chào <strong>${user.name}</strong>,</p>
        <p>Yêu cầu mượn thiết bị <strong>${device.name}</strong> (${quantity} chiếc) của bạn đã được <strong>phê duyệt</strong>.</p>
        <p>Vui lòng trả thiết bị trước: <strong>${formattedReturnDate}</strong>.</p>
        <p>Trân trọng,<br/>Hệ thống mượn thiết bị.</p>
    `

    await sendEmail({
        to: user.email,
        subject: 'Yêu cầu mượn thiết bị đã được duyệt',
        html
    })
}


// Gửi nhắc sắp đến hạn trả
export async function sendReminderEmail(user, device, returnDate) {
    if (!user?.email) return

    const date = new Date(returnDate)
    const formattedReturnDate = `${date.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    })} ${date.toLocaleDateString('vi-VN')}`

    const html = `
        <p>Xin chào <strong>${user.name}</strong>,</p>
        <p>Thiết bị <strong>${device.name}</strong> bạn đã mượn sẽ đến hạn trả vào: <strong>${formattedReturnDate}</strong>.</p>
        <p>Vui lòng sắp xếp thời gian trả đúng hạn để tránh bị cảnh báo quá hạn.</p>
        <p>Trân trọng,<br/>Hệ thống mượn thiết bị.</p>
    `

    await sendEmail({
        to: user.email,
        subject: 'Thiết bị sắp đến hạn trả',
        html
    })
}

// Gửi cảnh báo quá hạn
export async function sendOverdueAlertToAdmins(admins, user, device, returnDate) {
    const date = new Date(returnDate)
    const formattedReturnDate = `${date.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    })} ${date.toLocaleDateString('vi-VN')}`

    for (const admin of admins) {
        if (!admin?.email) continue

        const html = `
            <p>Xin chào <strong>${admin.name}</strong>,</p>
            <p>Thiết bị <strong>${device.name}</strong> do sinh viên <strong>${user.name}</strong> mượn đã <strong>quá hạn trả</strong> từ: <strong>${formattedReturnDate}</strong>.</p>
            <p>Vui lòng kiểm tra và xử lý kịp thời.</p>
            <p>Trân trọng,<br/>Hệ thống mượn thiết bị.</p>
        `

        await sendEmail({
            to: admin.email,
            subject: 'Cảnh báo thiết bị quá hạn trả',
            html,
        })
    }
}

// Gửi cảnh báo quá hạn trả thiết bị cho user
export async function sendOverdueEmailToUser(user, device, returnDate) {
    if (!user?.email) return

    const date = new Date(returnDate)
    const formattedReturnDate = `${date.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    })} ${date.toLocaleDateString('vi-VN')}`

    const html = `
        <p>Xin chào <strong>${user.name}</strong>,</p>
        <p>Thiết bị <strong>${device.name}</strong> bạn đã mượn đã <strong>quá hạn trả</strong> từ: <strong>${formattedReturnDate}</strong>.</p>
        <p>Vui lòng nhanh chóng liên hệ và hoàn trả thiết bị.</p>
        <p>Trân trọng,<br/>Hệ thống mượn thiết bị.</p>
    `

    await sendEmail({
        to: user.email,
        subject: 'Cảnh báo quá hạn trả thiết bị',
        html
    })
}

